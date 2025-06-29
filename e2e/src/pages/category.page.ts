import { Page, Locator } from "@playwright/test";

import { logger } from "../support/logger";
import { config } from "../config/env.config";

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
  readonly searchInput: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelButton: Locator;
  readonly cancelDeleteButton: Locator;

  private readonly actionTimeout: number =
    config.browser.actionTimeout || 10000;

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
    this.searchInput = this.page.locator('[data-testid="search-input"]');
    this.confirmDeleteButton = this.page.locator(
      '[data-testid="button-confirm-delete"]'
    );
    this.cancelButton = this.page.locator('[data-testid="button-cancel"]');
    this.cancelDeleteButton = this.page.locator(
      '[data-testid="button-cancel-delete"]'
    );
  }

  // Locators defined within methods for dynamic values
  private iconSelect = () =>
    this.page.locator(
      'div.el-form-item:has(label:has-text("Icon")) .el-select'
    );
  private iconOption = (icon: string) =>
    this.page.locator(`.el-select-dropdown__item:has-text("${icon}")`);
  private typeRadio = (categoryType: string) =>
    this.page.locator(
      `label.el-radio-button:has(input[value="${categoryType}"])`
    );
  private parentSelect = () =>
    this.page.locator(
      'div.el-form-item:has(label:has-text("Parent Category")) .el-select'
    );
  private parentOption = (parentCategory: string) =>
    this.page.locator(
      `.el-select-dropdown__item:has-text("${parentCategory}")`
    );
  private categoryNode = (categoryName: string) =>
    this.page.locator(".category-tree .tree-node-content", {
      hasText: categoryName,
    });
  private editButtonOnNode = (categoryName: string) =>
    this.categoryNode(categoryName)
      .locator("button.el-button--primary")
      .first();
  private deleteButtonOnNode = (categoryName: string) =>
    this.categoryNode(categoryName).locator("button.el-button--danger").first();
  private tab = (tabName: string) =>
    this.page.locator(
      `[role="tab"][aria-controls="pane-${tabName.toLowerCase()}"]`
    );
  public validationError = (message: string) =>
    this.page.locator(".el-form-item__error", { hasText: message });
  private newCategoryLocator = (name: string) =>
    this.page.locator(".category-tree .tree-node-content", {
      hasText: name,
    });
  public globalErrorMessage = (message: string) =>
    this.page.locator('[data-testid="error-message"]', { hasText: message });

  async navigateToCategories() {
    await this.categoriesMenuItem.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
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

    await this.iconSelect().click({ timeout: this.actionTimeout });
    const iconOptionLocator = this.iconOption(icon);
    await iconOptionLocator.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
    await iconOptionLocator.click({ timeout: this.actionTimeout });

    const typeRadioLocator = this.typeRadio(categoryType);
    await typeRadioLocator.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
    await typeRadioLocator.click({ timeout: this.actionTimeout });

    if (parentCategory && parentCategory !== "None") {
      await this.parentSelect().click({ timeout: this.actionTimeout });
      const parentOptionLocator = this.parentOption(parentCategory);
      await parentOptionLocator.waitFor({
        state: "visible",
        timeout: this.actionTimeout,
      });
      await parentOptionLocator.click({ timeout: this.actionTimeout });
    }
  }

  async submitForm() {
    await this.createButton.click({ timeout: this.actionTimeout });
    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "hidden",
      timeout: this.actionTimeout,
    });
    await this.page.waitForSelector(".el-message--success", {
      timeout: this.actionTimeout,
    });
  }

  async clickSubmit() {
    await this.createButton.click({ timeout: this.actionTimeout });
  }

  async isCategoryPresent(name: string): Promise<boolean> {
    const newCategory = this.newCategoryLocator(name);
    return (await newCategory.count()) > 0;
  }

  async openEditCategoryDialog(categoryName: string) {
    await this.editButtonOnNode(categoryName).click();
    await this.categoryForm.waitFor();
  }

  async openDeleteCategoryDialog(categoryName: string) {
    await this.page.waitForSelector(".category-tree .tree-node-content");
    logger.info(`Attempting to delete category: ${categoryName}`);
    await this.deleteButtonOnNode(categoryName).click({ force: true });
  }

  async confirmDelete() {
    logger.info("Confirming delete action");
    await this.confirmDeleteButton.click();
    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "hidden",
      timeout: this.actionTimeout,
    });
    await this.page.waitForSelector(".el-message--success", {
      timeout: this.actionTimeout,
    });
  }

  async searchCategories(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: this.actionTimeout,
    });
  }

  async filterByTab(tabName: string) {
    await this.tab(tabName).click({ timeout: this.actionTimeout });
    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: this.actionTimeout,
    });
  }

  async clearCategoryNameField() {
    await this.categoryNameInput.fill("");
  }

  async cancelCategoryForm() {
    await this.cancelButton.click({ timeout: this.actionTimeout });
    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "hidden",
      timeout: this.actionTimeout,
    });
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click({ timeout: this.actionTimeout });
    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "hidden",
      timeout: this.actionTimeout,
    });
  }
}
