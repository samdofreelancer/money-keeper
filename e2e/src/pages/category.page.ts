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
    this.categoriesMenuItem = page.locator('[data-testid="page-title"]');
    this.categoryItems = page.locator('[data-testid="tree-node-content"]');
    this.addCategoryButton = page.locator(
      '[data-testid="add-category-button"]'
    );
    this.categoryForm = page.locator('[data-testid="category-form"]');
    this.categoryNameInput = page.locator(
      '[data-testid="input-category-name"]'
    );
    this.categoryTypeSelectWrapper = page
      .locator('div.el-select__wrapper:has-text("Select")')
      .first();
    this.categoryTypeDropdown = page
      .locator(".el-select-dropdown:visible")
      .first();
    this.categoryTypeDropdownItemGrid = page.locator(
      '[data-testid="option-icon"]:has-text("Grid")'
    );
    this.categoryTypeRadioExpense = page.locator(
      '[data-testid="radio-expense"]'
    );
    this.createButton = page.locator('[data-testid="button-submit"]');
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

  async fillCategoryForm(
    name: string,
    icon: string,
    categoryType: string,
    parentCategory: string
  ) {
    await this.categoryNameInput.fill(name);

    // Select icon from dropdown
    const iconSelect = this.page.locator(
      'div.el-form-item:has(label:has-text("Icon")) .el-select'
    );
    await iconSelect.click({ timeout: 10000 });
    const iconOption = this.page.locator(
      `.el-select-dropdown__item:has-text("${icon}")`
    );
    await iconOption.waitFor({ state: "visible", timeout: 10000 });
    await iconOption.click({ timeout: 10000 });

    // Select category type radio button
    const typeRadio = this.page.locator(
      `label.el-radio-button:has(input[value="${categoryType}"])`
    );
    await typeRadio.waitFor({ state: "visible", timeout: 10000 });
    await typeRadio.click({ timeout: 10000 });

    // Select parent category if not None
    if (parentCategory && parentCategory !== "None") {
      const parentSelect = this.page.locator(
        'div.el-form-item:has(label:has-text("Parent Category")) .el-select'
      );
      await parentSelect.click({ timeout: 10000 });
      const parentOption = this.page.locator(
        `.el-select-dropdown__item:has-text("${parentCategory}")`
      );
      await parentOption.waitFor({ state: "visible", timeout: 10000 });
      await parentOption.click({ timeout: 10000 });
    }
  }

  async submitForm() {
    await this.createButton.click({ timeout: 10000 });
    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "hidden",
      timeout: 10000,
    });
    await this.page.waitForSelector(".el-message--success", {
      timeout: 10000,
    });
  }

  async clickSubmit() {
    await this.createButton.click({ timeout: 10000 });
  }

  async isCategoryPresent(name: string): Promise<boolean> {
    const newCategory = this.page.locator(".category-tree .tree-node-content", {
      hasText: name,
    });
    return (await newCategory.count()) > 0;
  }

  // New methods added below

  async openEditCategoryDialog(categoryName: string) {
    const categoryNode = this.page.locator(
      ".category-tree .tree-node-content",
      {
        hasText: categoryName,
      }
    );
    const editButton = categoryNode
      .locator("button.el-button--primary")
      .first();
    await editButton.click();
    await this.categoryForm.waitFor();
  }

  async openDeleteCategoryDialog(categoryName: string) {
    await this.page.waitForSelector(".category-tree .tree-node-content");
    const categoryNode = this.page.locator(
      ".category-tree .tree-node-content",
      {
        hasText: categoryName,
      }
    );
    console.log(`Clicking delete for category: ${categoryName}`);
    const deleteButton = categoryNode
      .locator("button.el-button--danger")
      .first();
    console.log("Delete button found:", deleteButton);
    await deleteButton.click({ force: true });
    console.log("Clicked delete, not waiting for dialog to be visible.");
  }

  async confirmDelete() {
    console.log("Attempting to click confirm delete button.");
    const confirmButton = this.page.locator(
      '[data-testid="button-confirm-delete"]'
    );
    await confirmButton.click();
    console.log("Clicked confirm delete button.");
    await this.page.waitForSelector(".el-dialog__wrapper", { state: "hidden" });
    await this.page.waitForSelector(".el-message--success");
  }

  async searchCategories(query: string) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.fill(query);
    // Wait for UI to update by waiting for category tree to update
    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: 10000,
    });
  }

  async filterByTab(tabName: string) {
    // In Element Plus, we need to target the tab button, not the tab panel
    // The tab button has aria-controls attribute that matches the panel id
    const tab = this.page.locator(
      `[role="tab"][aria-controls="pane-${tabName.toLowerCase()}"]`
    );
    await tab.click({ timeout: 10000 });
    // Wait for UI to update by waiting for category tree to update
    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: 10000,
    });
  }

  async clearCategoryNameField() {
    await this.categoryNameInput.fill("");
  }
}
