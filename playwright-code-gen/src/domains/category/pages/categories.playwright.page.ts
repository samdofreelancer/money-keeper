// src/domains/categories/pages/CategoriesPage.ts
import { Page, Locator, expect } from '@playwright/test';

type TimeoutMs = number | undefined;

export class CategoriesPage {
  constructor(private readonly page: Page) {}

  // --------- Test IDs (tập trung 1 chỗ để dễ đổi) ----------
  private readonly TID = {
    tree: 'category-tree',
    categoryName: 'category-name',              // <span data-testid="category-name">Food_Test</span> trong TREE

    btnAdd: 'add-category-button',
    inputName: 'input-category-name',

    iconTrigger: 'select-icon',                 // nút mở dropdown icon
    optionIcon: 'option-icon',                  // testid chung cho mỗi item trong dropdown (nếu có)

    btnSave: 'button-submit',
  } as const;

  // --------- Getters (locator bền vững) ----------
  private get categoryTree(): Locator {
    return this.page.getByTestId(this.TID.tree);
  }

  private get addCategoryButton(): Locator {
    return this.page
      .getByTestId(this.TID.btnAdd)
      .or(this.page.getByRole('button', { name: /^(add|new|create)\s+category/i }))
      .or(this.page.getByText(/^(add|new|create)\s+category/i));
  }

  private get nameInput(): Locator {
    // CHỈ nhắm đúng input tên, tránh bắt cả search-input
    return this.page.getByTestId(this.TID.inputName);
  }

  private get iconPickerTrigger(): Locator {
    return this.page
      .getByTestId(this.TID.iconTrigger)
      .or(this.page.getByRole('button', { name: /icon/i }));
  }

  private iconListbox(): Locator {
    // UI thường render dropdown dưới dạng listbox; chọn cái MỚI mở (last)
    return this.page.getByRole('listbox').last();
  }

  private iconOption(iconName: string): Locator {
    const listbox = this.iconListbox();

    // Use new testid pattern for specific icon selection
    const bySpecificTid = listbox.getByTestId(`icon-option-${iconName}`);

    // Fallback to role-based selection
    const byRole = listbox.getByRole('option', { name: iconName, exact: true });

    return bySpecificTid.or(byRole);
  }

  private get saveButton(): Locator {
    return this.page
      .getByTestId(this.TID.btnSave)
      .or(this.page.getByRole('button', { name: /save|create|submit/i }));
  }

  // --------- Page Contract ----------
  async goto(basePath: string = '/categories', timeout?: TimeoutMs) {
    await this.page.goto(basePath, { timeout });
    await this.assertLoaded(timeout);
  }

  async assertLoaded(timeout?: TimeoutMs) {
    await expect(this.page).toHaveURL(/\/categories\b/, { timeout });
    await expect(this.categoryTree).toBeVisible({ timeout });
  }

  // --------- Helpers kỹ thuật ----------
  private async fillInputByLocator(input: Locator, value: string, timeout?: TimeoutMs) {
    await expect(input).toBeEditable({ timeout });
    await input.click({ timeout });
    await this.page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await input.fill('', { timeout });
    await input.fill(value, { timeout });
  }

  // --------- Atomic actions ----------
  async clickAddCategoryButton(timeout?: TimeoutMs) {
    await expect(this.addCategoryButton).toBeVisible({ timeout });
    await this.addCategoryButton.click({ timeout });
  }

  async fillCategoryName(name: string, timeout?: TimeoutMs) {
    await this.fillInputByLocator(this.nameInput, name, timeout);
  }

  async openIconPicker(timeout?: TimeoutMs) {
    await expect(this.iconPickerTrigger).toBeVisible({ timeout });
    await this.iconPickerTrigger.click({ timeout });

    // chờ dropdown hiển thị để tránh click sớm
    await expect(this.iconListbox()).toBeVisible({ timeout });
  }

  async chooseIcon(iconName: string, timeout?: TimeoutMs) {
    const option = this.iconOption(iconName);
    await expect(option).toBeVisible({ timeout });
    await expect(option).toHaveCount(1, { timeout });      // tránh strict mode
    await option.scrollIntoViewIfNeeded().catch(() => {});
    await option.click({ timeout });
  }

  async submitCategory(timeout?: TimeoutMs) {
    await expect(this.saveButton).toBeEnabled({ timeout });
    await this.saveButton.click({ timeout });
  }

  // --------- tiện ích ----------
  async waitForIdle(afterMs = 50) {
    await this.page.waitForTimeout(afterMs);
  }

  // --------- VERIFY TRONG TREE (tránh dính dropdown/overlay) ----------
  private categoryItemsByName(name: string): Locator {
    // CHỈ tìm trong TREE và đúng testid hiển thị tên
    return this.categoryTree.getByTestId(this.TID.categoryName).filter({ hasText: name });
  }

  async categoryExists(name: string): Promise<boolean> {
    return this.categoryItemsByName(name).isVisible().catch(() => false);
  }

  async expectCategoryVisible(name: string) {
    await expect(this.categoryItemsByName(name)).toBeVisible();
  }

  async expectCategoryNotVisible(name: string) {
    await expect(this.categoryItemsByName(name)).toHaveCount(0);
  }
}
