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
    await iconSelect.click();
    const iconOption = this.page.locator(
      `.el-select-dropdown__item:has-text("${icon}")`
    );
    await iconOption.waitFor({ state: "visible", timeout: 5000 });
    await iconOption.click();

    // Select category type radio button
    const typeRadio = this.page.locator(
      `label.el-radio-button:has(input[value="${categoryType}"])`
    );
    await typeRadio.waitFor({ state: "visible", timeout: 5000 });
    await typeRadio.click();

    // Select parent category if not None
    if (parentCategory && parentCategory !== "None") {
      const parentSelect = this.page.locator(
        'div.el-form-item:has(label:has-text("Parent Category")) .el-select'
      );
      await parentSelect.click();
      const parentOption = this.page.locator(
        `.el-select-dropdown__item:has-text("${parentCategory}")`
      );
      await parentOption.waitFor({ state: "visible", timeout: 5000 });
      await parentOption.click();
    }
  }

async submitSaveForm() {
  console.log("Submitting category form with Save button...");
  const saveButton = this.page.locator('button:has-text("Save")');
  await saveButton.click();
  console.log(
    "Clicked Save button, waiting for dialog to close and success message..."
  );
  await this.page.waitForSelector(".el-dialog__wrapper", {
    state: "hidden",
    timeout: 10000,
  });
  console.log("Dialog closed.");
  await this.page.waitForSelector(".el-message--success", { timeout: 10000 });
  console.log("Success message appeared.");
}

async submitCreateForm() {
  console.log("Submitting category form with Create button...");
  await this.createButton.click();
  console.log(
    "Clicked Create button, waiting for dialog to close and success message..."
  );
  await this.page.waitForSelector(".el-dialog__wrapper", {
    state: "hidden",
    timeout: 10000,
  });
  console.log("Dialog closed.");
  await this.page.waitForSelector(".el-message--success", { timeout: 10000 });
  console.log("Success message appeared.");
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
    const editButton = categoryNode.locator("button.el-button--primary");
    await editButton.click();
    await this.categoryForm.waitFor();
  }

  async openDeleteCategoryDialog(categoryName: string) {
    const categoryNode = this.page.locator(
      ".category-tree .tree-node-content",
      {
        hasText: categoryName,
      }
    );
    const deleteButton = categoryNode.locator("button.el-button--danger");
    await deleteButton.click();
    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "visible",
    });
  }

  async confirmDelete() {
    const confirmButton = this.page.locator(
      '.el-dialog__wrapper button:has-text("Delete")'
    );
    await confirmButton.click();
    await this.page.waitForSelector(".el-dialog__wrapper", { state: "hidden" });
    await this.page.waitForSelector(".el-message--success", { timeout: 10000 });
  }

  async searchCategories(query: string) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.fill(query);
    // Wait for UI to update by waiting for category tree to update
    await this.page.waitForSelector('[data-testid="category-tree"]');
  }

  async filterByTab(tabName: string) {
    const tab = this.page.locator(
      `[data-testid="tab-${tabName.toLowerCase()}"]`
    );
    await tab.click();
    // Wait for UI to update by waiting for category tree to update
    await this.page.waitForSelector('[data-testid="category-tree"]');
  }

  async clearCategoryNameField() {
    await this.categoryNameInput.fill("");
  }
}
