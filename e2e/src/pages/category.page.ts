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

  async submitCategoryForm() {
    await this.createButton.click();
    await this.categoryForm.waitFor({ state: "detached", timeout: 15000 });
  }

  async isCategoryPresent(name: string): Promise<boolean> {
    const newCategory = this.page.locator(".category-tree .tree-node-content", {
      hasText: name,
    });
    return (await newCategory.count()) > 0;
  }

  async openEditCategoryDialog(categoryName: string) {
    // Use first matching category item to avoid strict mode violation
    const categoryItems = this.page.locator(
      ".category-tree .tree-node-content",
      {
        hasText: categoryName,
      }
    );
    const count = await categoryItems.count();
    console.log(`Found ${count} categories matching "${categoryName}"`);
    if (count === 0) {
      throw new Error(`Category with name "${categoryName}" not found`);
    }
    const categoryItem = categoryItems.nth(0);
    await categoryItem.hover();
    console.log(`Hovering over category: ${categoryName}`);
    const editButton = categoryItem.locator('button[title="Edit"]');
    await editButton.waitFor({ state: "visible", timeout: 10000 });
    await editButton.click();
    console.log(`Clicked edit button for category: ${categoryName}`);
    try {
      await this.categoryForm.waitFor({ timeout: 20000 });
      console.log(`Category form appeared for editing`);
    } catch (error) {
      console.error(`Error waiting for category form: ${error}`);
      throw error;
    }
  }
}
