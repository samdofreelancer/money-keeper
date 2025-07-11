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
    
    // Wait for either success message or dialog to close
    try {
      await Promise.race([
        this.page.waitForSelector(".el-dialog__wrapper", {
          state: "hidden",
          timeout: this.actionTimeout,
        }),
        this.page.waitForSelector(".el-message--success", {
          timeout: this.actionTimeout,
        }),
      ]);
    } catch (error) {
      logger.info("Form submission completed without success message");
    }
    
    // Give a small delay for the page to update
    await this.page.waitForTimeout(1000);
  }

  async clickSubmit() {
    await this.createButton.click({ timeout: this.actionTimeout });
  }

  async isCategoryPresent(name: string): Promise<boolean> {
    try {
      // Wait a bit for any UI updates
      await this.page.waitForTimeout(500);
      const newCategory = this.newCategoryLocator(name);
      const count = await newCategory.count();
      logger.info(`Checking for category "${name}": found ${count} matches`);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking category presence: ${error}`);
      return false;
    }
  }

  async openEditCategoryDialog(categoryName: string) {
    try {
      logger.info(`Opening edit dialog for category: ${categoryName}`);
      await this.page.waitForSelector(".category-tree .tree-node-content", {
        timeout: this.actionTimeout,
      });
      
      const editButton = this.editButtonOnNode(categoryName);
      await editButton.waitFor({ state: "visible", timeout: this.actionTimeout });
      await editButton.click({ timeout: this.actionTimeout });
      
      await this.categoryForm.waitFor({
        state: "visible",
        timeout: this.actionTimeout,
      });
      logger.info(`Edit dialog opened successfully for: ${categoryName}`);
    } catch (error) {
      logger.error(`Failed to open edit dialog for ${categoryName}: ${error}`);
      throw error;
    }
  }

  async openDeleteCategoryDialog(categoryName: string) {
    try {
      logger.info(`Opening delete dialog for category: ${categoryName}`);
      
      // Wait for category tree to be ready
      await this.page.waitForSelector(".category-tree .tree-node-content", {
        timeout: this.actionTimeout,
      });
      
      // Find and hover over the category node to reveal action buttons
      const categoryNode = this.categoryNode(categoryName);
      await categoryNode.waitFor({ state: "visible", timeout: this.actionTimeout });
      await categoryNode.hover();
      await this.page.waitForTimeout(500); // Brief wait for hover effects
      
      // Find delete button (try primary selector, fallback to danger class)
      let deleteButton = this.deleteButtonOnNode(categoryName);
      
      try {
        await deleteButton.waitFor({ state: "visible", timeout: 3000 });
      } catch (error) {
        // Fallback: try alternative delete button selector
        deleteButton = categoryNode.locator('button.el-button--danger, button[class*="danger"]');
        await deleteButton.waitFor({ state: "visible", timeout: 3000 });
      }
      
      // Click delete button
      await deleteButton.click({ timeout: this.actionTimeout });
      
      // Wait for confirmation dialog (try primary selector, fallback to common alternatives)
      let dialogSelector = ".el-dialog__wrapper";
      
      try {
        await this.page.waitForSelector(dialogSelector, {
          state: "visible",
          timeout: 5000,
        });
      } catch (error) {
        // Fallback: try alternative dialog selectors
        const altSelectors = [".el-dialog", ".el-message-box", ".modal"];
        let found = false;
        
        for (const selector of altSelectors) {
          try {
            await this.page.waitForSelector(selector, {
              state: "visible", 
              timeout: 2000,
            });
            dialogSelector = selector;
            found = true;
            break;
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (!found) {
          throw new Error(`Delete confirmation dialog not found for category: ${categoryName}`);
        }
      }
      
      logger.info(`Delete confirmation dialog opened for: ${categoryName}`);
    } catch (error) {
      logger.error(`Failed to open delete dialog for ${categoryName}: ${error}`);
      throw error;
    }
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
    logger.info(`Filling search input with: "${query}"`);
    
    // Make sure search input is visible and ready
    await this.searchInput.waitFor({ state: "visible", timeout: this.actionTimeout });
    
    // Clear any existing search text first
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
    
    // Fill the search input
    await this.searchInput.fill(query);
    
    // Verify the search input has the correct value
    const inputValue = await this.searchInput.inputValue();
    logger.info(`Search input value after fill: "${inputValue}"`);
    
    // Wait for search to complete - give some time for filtering
    await this.page.waitForTimeout(2000);
    
    // Make sure the category tree is still present
    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: this.actionTimeout,
    });
    
    logger.info(`Search completed for: "${query}"`);
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

  // Additional methods for new step definitions
  async getSearchValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  async isSearchInputVisible(): Promise<boolean> {
    return await this.searchInput.isVisible();
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.categoriesMenuItem.isVisible();
  }
}
