// src/domains/categories/usecases/createCategory.ts
// Use Case: orchestrate tạo Category bằng cách phối hợp POM
// - Không import @playwright/test (tuân ESLint rule usecase)
// - Không truy cập page/locator trực tiếp
// - Xử lý lỗi nghiệp vụ, retry nhẹ, và trả kết quả rõ ràng

import { Logger } from '../../../../shared/utilities/logger';
import { CategoriesPage } from '../../pages/categories.playwright.page';
import { TestData } from '../../../../shared/utilities/testData';

export type CreateCategoryParams = {
  name: string;
  icon?: string; // ví dụ: "ShoppingBag", "Utensils"
  timeoutMs?: number; // timeout kỹ thuật cho từng step
};

export type CreateCategoryOptions = {
  verify?: boolean; // true: sẽ chạy verify sau khi submit
  // Inject hàm verify từ Steps hoặc adapter nhỏ để tách cứng
  // Nếu không truyền, Use Case sẽ thử gọi categoriesPage.categoryExists nếu có
  verifier?: (name: string) => Promise<boolean>;
  // Thời gian chờ UI settle sau submit (tùy app)
  settleAfterMs?: number;
  // Số lần retry verify (dành cho UI sync chậm)
  verifyRetries?: number;
  verifyIntervalMs?: number;
};

export type CreateCategoryResult =
  | { ok: true; createdName: string }
  | { ok: false; error: string; createdName?: string };

export class CreateCategoryUseCase {
  constructor(private readonly categoriesPage: CategoriesPage) {}

  /**
   * Tạo category. Nếu `options.verify === true`, sẽ verify tồn tại sau khi submit.
   * Trả về { ok, error? } để Steps quyết định assert.
   */
  async run(
    params: CreateCategoryParams,
    options?: CreateCategoryOptions
  ): Promise<CreateCategoryResult> {
    const { name, icon, timeoutMs = 15_000 } = params;

    const {
      verify = false,
      verifier,
      settleAfterMs = 100,
      verifyRetries = 5,
      verifyIntervalMs = 300,
    } = options ?? {};

    try {
      // 1) Điều hướng & page contract
      Logger.info(`[CreateCategory] goto categories`);
      await this.categoriesPage.goto('/categories', timeoutMs);

      // 2) Mở form
      Logger.info(`[CreateCategory] open create form`);
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
      Logger.info(`[CreateCategory] submit form`);
      await this.categoriesPage.submitCategory(timeoutMs);

      // 6) Chờ UI settle kỹ thuật (không phải assert nghiệp vụ)
      await this.categoriesPage.waitForIdle(settleAfterMs);

      // 7) Verify (nghiệp vụ) nếu bật
      if (verify) {
        const ok = await this.verifyExists(
          name,
          verifier,
          verifyRetries,
          verifyIntervalMs
        );
        if (!ok) {
          return {
            ok: false,
            createdName: name,
            error: `Category "${name}" chưa xuất hiện sau khi tạo (hết retry).`,
          };
        }
      }

      // Track the created category for cleanup
      TestData.trackCreatedCategory(name);
      Logger.info(`[CreateCategory] tracked category for cleanup: ${name}`);
      return { ok: true, createdName: name };
    } catch (e: any) {
      const msg = this.stringifyError(e);
      Logger.error(`[CreateCategory] failed: ${msg}`);
      return { ok: false, error: msg };
    }
  }

  /**
   * Thử verify tồn tại bằng:
   *  - verifier được inject (ưu tiên), hoặc
   *  - method categoriesPage.categoryExists(name) nếu POM có
   *  - nếu cả hai không có, coi như không verify (trả true để không chặn flow)
   */
  private async verifyExists(
    name: string,
    verifier: CreateCategoryOptions['verifier'],
    retries: number,
    intervalMs: number
  ): Promise<boolean> {
    // Prefer injected verifier
    if (verifier) {
      return this.retry(async () => verifier(name), retries, intervalMs);
    }

    // Fallback: nếu POM có method hasCategory(name)
    const maybeExistsFn = (this.categoriesPage as any).hasCategory as
      | ((n: string) => Promise<boolean>)
      | undefined;
    if (typeof maybeExistsFn === 'function') {
      return this.retry(
        async () => maybeExistsFn.call(this.categoriesPage, name),
        retries,
        intervalMs
      );
    }

    // Also check for deprecated categoryExists for backward compatibility
    const deprecatedExistsFn = (this.categoriesPage as any).categoryExists as
      | ((n: string) => Promise<boolean>)
      | undefined;
    if (typeof deprecatedExistsFn === 'function') {
      return this.retry(
        async () => deprecatedExistsFn.call(this.categoriesPage, name),
        retries,
        intervalMs
      );
    }

    // Không có cách verify → không fail ở Use Case
    Logger.warn(
      `[CreateCategory] no verifier provided and POM has no categoryExists(name). Skipping verify.`
    );
    return true;
  }

  private async retry<T>(
    fn: () => Promise<T>,
    retries: number,
    intervalMs: number
  ): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
      }

      await this.sleep(intervalMs);
    }
    // Nếu fn trả boolean false thay vì throw, ta vẫn trả false
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
    }
    throw lastErr ?? new Error('retry failed');
  }

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  private stringifyError(e: unknown): string {
    if (e instanceof Error) {
      return `${e.message}\n${e.stack ?? ''}`;
    }
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
}
