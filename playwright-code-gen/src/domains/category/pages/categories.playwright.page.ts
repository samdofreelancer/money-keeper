// src/domains/categories/pages/CategoriesPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { Inject, TOKENS, Transient } from 'shared/di';

type TimeoutMs = number | undefined;

@Transient({ token: TOKENS.CategoriesPage })
export class CategoriesPage {
  constructor(@Inject(TOKENS.Page) private readonly page: Page) {}

  // --------- Test IDs (tập trung 1 chỗ để dễ đổi) ----------
  private readonly TID = {
    tree: 'category-tree',
    categoryName: 'category-name', // <span data-testid="category-name">Food_Test</span> trong TREE

    btnAdd: 'add-category-button',
    inputName: 'input-category-name',

    iconTrigger: 'select-icon', // nút mở dropdown icon
    optionIcon: 'option-icon', // testid chung cho mỗi item trong dropdown (nếu có)

    btnSave: 'button-submit',
  } as const;

  // --------- Getters (locator bền vững) ----------
  private get categoryTree(): Locator {
    return this.page.getByTestId(this.TID.tree);
  }

  private get addCategoryButton(): Locator {
    return this.page
      .getByTestId(this.TID.btnAdd)
      .or(
        this.page.getByRole('button', { name: /^(add|new|create)\s+category/i })
      )
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
  private async fillInputByLocator(
    input: Locator,
    value: string,
    timeout?: TimeoutMs
  ) {
    await expect(input).toBeEditable({ timeout });
    await input.click({ timeout });
    await this.page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+A' : 'Control+A'
    );
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
    await expect(option).toHaveCount(1, { timeout }); // tránh strict mode
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

  // --------- Business data accessors ----------
  private categoryItemsByName(name: string): Locator {
    // CHỈ tìm trong TREE và đúng testid hiển thị tên
    return this.categoryTree
      .getByTestId(this.TID.categoryName)
      .filter({ hasText: name });
  }

  /**
   * Returns a locator for the category row by name
   * @param name - The category name to find
   */
  async categoryRow(name: string): Promise<Locator> {
    return this.categoryItemsByName(name);
  }

  /**
   * Checks if a category exists in the tree using multiple selector strategies
   * @param name - The category name to check
   * @returns Promise<boolean> - true if category exists, false otherwise
   */
  async hasCategory(name: string): Promise<boolean> {
    const slug = this.slugify(name);

    // Priority data-testid (if any)
    const byTestId = this.page.getByTestId(`category-node-${slug}`);
    if (await byTestId.isVisible().catch(() => false)) return true;

    // Fallback: find by role/treeitem or text
    const byRole = this.page.getByRole('treeitem', { name, exact: true });
    if (await byRole.isVisible().catch(() => false)) return true;

    const byText = this.page.locator(`text=${name}`);
    return byText
      .first()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Checks if the empty state is visible when no categories exist
   * @returns Promise<boolean> - true if empty state is visible, false otherwise
   */
  async isEmptyStateVisible(): Promise<boolean> {
    const emptyState = this.page
      .getByTestId('no-data')
      .or(this.page.getByTestId('empty-state'));
    return emptyState.isVisible().catch(() => false);
  }

  /**
   * @deprecated Use hasCategory() instead for boolean checks
   * Business assertions should be made in step/use-case layers
   */
  async categoryExists(name: string): Promise<boolean> {
    return this.hasCategory(name);
  }

  /**
   * Helper method to slugify category names for test IDs
   * @param name - The name to slugify
   * @returns The slugified name
   */
  private slugify(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
