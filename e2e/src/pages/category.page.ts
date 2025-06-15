import { Page, Locator } from "@playwright/test";

export class CategoryPage {
  readonly page: Page;
  readonly categoriesMenuItem: Locator;
  readonly categoryItems: Locator;
  readonly addCategoryButton: Locator;
  readonly categoryForm: Locator;
  readonly categoryNameInput: Locator;
  readonly categoryTypeSelectWrapper: Locator;
  readonly categoryTypeDropdown: Locator;
  readonly categoryTypeDropdownItemGrid: Locator;
  readonly categoryTypeRadioExpense: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoriesMenuItem = page.locator(
      'li.el-menu-item:has-text("Categories")'
    );
    this.categoryItems = page.locator(".category-tree .tree-node-content");
    this.addCategoryButton = page.locator('button:has-text("Add Category")');
    this.categoryForm = page.locator("form.category-form");
    this.categoryNameInput = page.locator(
      'input[placeholder="Enter category name"]'
    );
    this.categoryTypeSelectWrapper = page
      .locator('div.el-select__wrapper:has-text("Select")')
      .first();
    this.categoryTypeDropdown = page
      .locator(".el-select-dropdown:visible")
      .first();
    this.categoryTypeDropdownItemGrid = page.locator(
      '.el-select-dropdown__item:has-text("Grid")'
    );
    this.categoryTypeRadioExpense = page.locator(
      'label.el-radio-button:has(input[value="EXPENSE"])'
    );
    this.createButton = page.locator('button:has-text("Create")');
  }

  async navigateToCategories() {
    await this.categoriesMenuItem.waitFor({ state: "visible", timeout: 10000 });
    await this.categoriesMenuItem.click();
    await this.page.waitForLoadState("networkidle");
  }

  async getCategoryCount(): Promise<number> {
    return await this.categoryItems.count();
  }

  async openCreateCategoryDialog() {
    await this.addCategoryButton.click();
    await this.categoryForm.waitFor();
  }

  async fillCategoryForm(name: string) {
    await this.categoryNameInput.fill(name);
    await this.categoryTypeSelectWrapper.click();
    await this.categoryTypeDropdown.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.categoryTypeDropdownItemGrid.click();
    await this.categoryTypeRadioExpense.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.categoryTypeRadioExpense.click();
  }

  async submitCategoryForm() {
    await this.createButton.click();
    await this.categoryForm.waitFor({ state: "detached" });
  }

  async isCategoryPresent(name: string): Promise<boolean> {
    const newCategory = this.page.locator(".category-tree .tree-node-content", {
      hasText: name,
    });
    return (await newCategory.count()) > 0;
  }
}
