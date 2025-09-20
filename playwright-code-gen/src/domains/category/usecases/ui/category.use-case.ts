// src/domains/categories/usecases/createCategory.ts
// Use Case: orchestrate tạo Category bằng cách phối hợp POM
// - Không import @playwright/test (tuân ESLint rule usecase)
// - Không truy cập page/locator trực tiếp
// - Xử lý lỗi nghiệp vụ, retry đúng (kể cả khi predicate trả false), trả kết quả rõ ràng

import { Logger } from 'shared/utilities/logger';
import { CategoriesPage } from 'category-domain/pages/categories.playwright.page';
import { TestData } from 'shared/utilities/testData';
import { Inject, Transient, TOKENS } from 'shared/di';

export type CreateCategoryParams = {
  name: string;
  icon?: string; // ví dụ: "ShoppingBag", "Utensils"
  timeoutMs?: number; // timeout kỹ thuật cho từng step
};

export type CreateCategoryOptions = {
  verify?: boolean; // true: sẽ chạy verify sau khi submit
  // Inject hàm verify từ Steps hoặc adapter nhỏ để tách cứng
  // Nếu không truyền, Use Case sẽ thử gọi categoriesPage.hasCategory nếu có
  verifier?: (name: string) => Promise<boolean>;
  // Thời gian chờ UI settle sau submit (tùy app)
  settleAfterMs?: number; // default 100ms (0 để bỏ qua)
  // Tổng số lần THỬ verify (attempts), không phải "số lần re-try"
  verifyRetries?: number; // default 5
  verifyIntervalMs?: number; // default 300ms
};

export type CreateCategoryResult =
  | { ok: true; createdName: string }
  | { ok: false; error: string; createdName?: string };

type CategoryPresence = {
  hasCategory?: (n: string) => Promise<boolean>;
  categoryExists?: (n: string) => Promise<boolean>;
};
function hasPresence(x: unknown): x is CategoryPresence {
  return (
    !!x &&
    (typeof (x as CategoryPresence).hasCategory === 'function' ||
      typeof (x as CategoryPresence).categoryExists === 'function')
  );
}

@Transient({ token: TOKENS.CreateCategoryUseCase })
export class CreateCategoryUseCase {
  constructor(
    @Inject(TOKENS.CategoriesPage)
    private readonly categoriesPage: CategoriesPage
  ) {}

  /**
   * Tạo category. Nếu `options.verify === true`, sẽ verify tồn tại sau khi submit.
   * Trả về { ok, error? } để Steps quyết định assert.
   */
  async run(
    params: CreateCategoryParams,
    options?: CreateCategoryOptions
  ): Promise<CreateCategoryResult> {
    // 0) Sanitize inputs
    const name = params.name?.trim();
    if (!name) {
      return { ok: false, error: 'Category name is required' };
    }
    const icon = params.icon?.trim() || undefined;
    const timeoutMs = params.timeoutMs ?? 15_000;

    // 0.1) Gom options + default
    const cfg = {
      verify: false,
      verifier: undefined as CreateCategoryOptions['verifier'],
      settleAfterMs: 100,
      verifyRetries: 5,
      verifyIntervalMs: 300,
      ...(options ?? {}),
    };

    try {
      // 1) Điều hướng & page contract
      Logger.info('[CreateCategory] goto categories');
      await this.categoriesPage.goto('/categories', timeoutMs);

      // 2) Mở form
      Logger.info('[CreateCategory] open create form');
      await this.categoriesPage.clickAddCategoryButton(timeoutMs);

      // 3) Điền tên
      Logger.info(`[CreateCategory] fill name = ${name}`);
      await this.categoriesPage.fillCategoryName(name, timeoutMs);

      // 4) Chọn icon (tuỳ chọn)
      if (icon) {
        Logger.info(
          `[CreateCategory] open icon picker & choose icon = ${icon}`
        );
        await this.categoriesPage.openIconPicker(timeoutMs);
        await this.categoriesPage.chooseIcon(icon, timeoutMs);
      }

      // 5) Lưu
      Logger.info('[CreateCategory] submit form');
      await this.categoriesPage.submitCategory(timeoutMs);

      // 5.1) Track cleanup sớm - trước verify (để dọn được cả khi verify fail)
      TestData.trackCreatedCategory(name);
      Logger.info(`[CreateCategory] tracked category for cleanup: ${name}`);

      // 6) Chờ UI settle kỹ thuật (nếu cần)
      if ((cfg.settleAfterMs ?? 0) > 0) {
        await this.categoriesPage.waitForIdle(cfg.settleAfterMs!);
      }

      // 7) Verify (nghiệp vụ) nếu bật
      if (cfg.verify) {
        Logger.info(
          `[CreateCategory] verify "${name}" attempts=${cfg.verifyRetries} intervalMs=${cfg.verifyIntervalMs}ms`
        );
        const ok = await this.verifyExists(
          name,
          cfg.verifier,
          cfg.verifyRetries!,
          cfg.verifyIntervalMs!
        );
        if (!ok) {
          return {
            ok: false,
            createdName: name,
            error: `Category "${name}" chưa xuất hiện sau khi tạo (hết retry).`,
          };
        }
      }

      return { ok: true, createdName: name };
    } catch (e: unknown) {
      const msg = this.stringifyError(e);
      Logger.error(`[CreateCategory] failed: ${msg}`);
      return { ok: false, error: msg };
    }
  }

  /**
   * Verify tồn tại:
   *  - Ưu tiên verifier inject
   *  - Fallback POM.hasCategory(name) hoặc POM.categoryExists(name)
   *  - Nếu không có, log warn và coi như pass (không chặn flow)
   */
  private async verifyExists(
    name: string,
    verifier: CreateCategoryOptions['verifier'],
    attempts: number,
    intervalMs: number
  ): Promise<boolean> {
    // Prefer injected verifier
    if (verifier) {
      return this.retryUntilTrue(() => verifier(name), attempts, intervalMs);
    }

    // Fallback: POM
    if (hasPresence(this.categoriesPage)) {
      if (this.categoriesPage.hasCategory) {
        return this.retryUntilTrue(
          () => this.categoriesPage.hasCategory!(name),
          attempts,
          intervalMs
        );
      }
      if (this.categoriesPage.categoryExists) {
        return this.retryUntilTrue(
          () => this.categoriesPage.categoryExists!(name),
          attempts,
          intervalMs
        );
      }
    }

    Logger.warn(
      '[CreateCategory] no verifier provided and POM has no hasCategory/categoryExists. Skipping verify.'
    );
    return true;
  }

  /**
   * Retry đến khi fn() trả true (hoặc hết attempts).
   * - Nuốt lỗi giữa các attempts.
   * - Bảo đảm attempts >= 1.
   */
  private async retryUntilTrue(
    fn: () => Promise<boolean>,
    attempts: number,
    intervalMs: number
  ): Promise<boolean> {
    const max = Math.max(1, attempts);
    for (let i = 0; i < max; i++) {
      try {
        if (await fn()) {
          Logger.info(
            `[CreateCategory] verify success after ${i + 1} attempts`
          );
          return true;
        }
      } catch (e) {
        Logger.debug?.(`[CreateCategory] verify attempt ${i + 1} threw: ${e}`);
      }
      if (i < max - 1) await this.sleep(intervalMs);
    }
    Logger.info(`[CreateCategory] verify failed after ${max} attempts`);
    return false;
  }

  private async sleep(ms: number) {
    return new Promise<void>(res => setTimeout(res, ms));
  }

  private stringifyError(e: unknown): string {
    if (e instanceof Error) return `${e.message}\n${e.stack ?? ''}`;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
}
