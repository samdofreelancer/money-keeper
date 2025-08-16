// src/domains/categories/pages/CategoriesPage.ts
import { Page, Locator, expect } from '@playwright/test';

type TimeoutMs = number | undefined;

export class CategoriesPage {
  constructor(private readonly page: Page) {}

  // --------- Test IDs (tập trung 1 chỗ để dễ đổi) ----------
  private readonly TID = {
    tree: 'category-tree',
    btnAdd: 'add-category-button',
    inputName: 'input-category-name',
    iconTrigger: 'select-icon',
    iconOption: (name: string) => `icon-option-${name}`, // khuyến nghị set data-testid cho từng option
    btnSave: 'button-submit',
  } as const;

  // --------- Getters (locator bền vững) ----------
  private get categoryTree(): Locator {
    return this.page.getByTestId(this.TID.tree);
  }
  private get addCategoryButton(): Locator {
    return this.page.getByTestId(this.TID.btnAdd);
  }
  private get nameInput(): Locator {
    return this.page.getByTestId(this.TID.inputName);
  }
  private get iconPickerTrigger(): Locator {
    return this.page.getByTestId(this.TID.iconTrigger);
  }
  private iconOption(name: string): Locator {
    // Ưu tiên data-testid; fallback role nếu bạn chưa gắn testid cho option
    const byTestId = this.page.getByTestId(this.TID.iconOption(name));
    return byTestId.or(this.page.getByRole('option', { name, exact: true }));
  }
  private get saveButton(): Locator {
    return this.page.getByTestId(this.TID.btnSave);
  }

  // --------- Page Contract ----------
  async goto(basePath: string = '/categories', timeout?: TimeoutMs) {
    await this.page.goto(basePath, { timeout });
    await this.assertLoaded(timeout);
  }

  /**
   * Page contract: trang đã sẵn sàng để tương tác.
   * Giữ các expect kỹ thuật ở đây (KHÔNG assert nghiệp vụ).
   */
  async assertLoaded(timeout?: TimeoutMs) {
    await expect(this.page).toHaveURL(/\/categories\b/, { timeout });
    await expect(this.categoryTree).toBeVisible({ timeout });
  }

  // --------- Helpers “kỹ thuật” dùng lại ----------
  private async fillInput(testId: string, value: string, timeout?: TimeoutMs) {
    const input = this.page.getByTestId(testId);
    await expect(input).toBeEditable({ timeout }); // guard kỹ thuật: hợp lệ trong POM
    // Clear chắc ăn: select-all rồi fill trống
    await input.click({ timeout });
    await this.page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await input.fill('', { timeout });
    await input.fill(value, { timeout });
  }

  // --------- Atomic actions (không chứa nghiệp vụ) ----------
  async clickAddCategoryButton(timeout?: TimeoutMs) {
    await expect(this.addCategoryButton).toBeVisible({ timeout });
    await this.addCategoryButton.click({ timeout });
  }

  async fillCategoryName(name: string, timeout?: TimeoutMs) {
    await this.fillInput(this.TID.inputName, name, timeout);
  }

  async openIconPicker(timeout?: TimeoutMs) {
    await expect(this.iconPickerTrigger).toBeVisible({ timeout });
    await this.iconPickerTrigger.click({ timeout });
  }

  async chooseIcon(iconName: string, timeout?: TimeoutMs) {
    const option = this.iconOption(iconName);
    await expect(option).toBeVisible({ timeout });
    await option.click({ timeout });
  }

  async submitCategory(timeout?: TimeoutMs) {
    await expect(this.saveButton).toBeEnabled({ timeout });
    await this.saveButton.click({ timeout });
  }

  // --------- tiện ích: chờ UI settle sau action (không phải assert nghiệp vụ) ----------
  /**
   * Ví dụ: chờ request idle hoặc network quiet sau khi bấm lưu.
   * Tùy app, bạn có thể đổi sang waitForResponse theo API/route cụ thể.
   */
  async waitForIdle(afterMs = 50) {
    // tránh toHaveURL/toHaveText ở đây (đó là nghiệp vụ/đầu ra), chỉ “kỹ thuật” cho UI yên vị.
    await this.page.waitForTimeout(afterMs);
  }
}
