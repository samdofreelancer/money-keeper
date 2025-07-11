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
      
      // Debug: Check what's currently visible on the page
      logger.info("Debugging page state before looking for category tree...");
      
      // Try to find any categories first with different selectors
      const possibleSelectors = [
        ".category-tree .tree-node-content",
        "[data-testid='category-tree'] .tree-node-content", 
        ".tree-node-content",
        "[data-testid='tree-node-content']",
        ".category-item",
        ".category-list-item",
        ".el-tree-node",
        ".category-tree"
      ];
      
      let foundSelector = null;
      for (const selector of possibleSelectors) {
        try {
          const elements = this.page.locator(selector);
          const count = await elements.count();
          logger.info(`Selector "${selector}": found ${count} elements`);
          
          if (count > 0) {
            foundSelector = selector;
            // Log the content of first few elements
            for (let i = 0; i < Math.min(count, 3); i++) {
              const text = await elements.nth(i).textContent();
              logger.info(`  Element ${i}: "${text}"`);
            }
            break;
          }
        } catch (error) {
          logger.info(`Selector "${selector}": error - ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      if (!foundSelector) {
        // Take a screenshot for debugging
        await this.page.screenshot({ path: 'debug-no-categories.png', fullPage: true });
        logger.error("No category elements found with any selector. Screenshot saved as debug-no-categories.png");
        
        // Log the page URL and title
        const url = this.page.url();
        const title = await this.page.title();
        logger.info(`Current page URL: ${url}`);
        logger.info(`Current page title: ${title}`);
        
        throw new Error("No category tree elements found on the page");
      }
      
      logger.info(`Using working selector: ${foundSelector}`);
      
      // Wait for the category tree to be ready
      await this.page.waitForSelector(foundSelector, {
        timeout: this.actionTimeout,
      });
      
      logger.info(`Waiting for specific category node: ${categoryName}`);
      // First, let's find the category node
      const categoryNode = this.categoryNode(categoryName);
      
      // Debug: Check if our specific category exists
      try {
        await categoryNode.waitFor({ state: "visible", timeout: 5000 });
        logger.info(`Found category node for: ${categoryName}`);
      } catch (error) {
        logger.error(`Cannot find category node for: ${categoryName}`);
        
        // Debug: List all visible categories
        const allCategoryElements = this.page.locator(foundSelector);
        const count = await allCategoryElements.count();
        logger.info(`Total categories visible: ${count}`);
        
        for (let i = 0; i < count; i++) {
          const text = await allCategoryElements.nth(i).textContent();
          logger.info(`Category ${i}: "${text}"`);
        }
        
        throw new Error(`Category "${categoryName}" not found in the list`);
      }
      
      // Try hovering over the category node in case buttons appear on hover
      await categoryNode.hover();
      await this.page.waitForTimeout(1000);
      logger.info(`Hovered over category node for: ${categoryName}`);
      
      // Debug: Log all buttons in the category node
      const allButtons = categoryNode.locator("button");
      const buttonCount = await allButtons.count();
      logger.info(`Found ${buttonCount} buttons in category node`);
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const buttonClass = await button.getAttribute("class");
        const buttonText = await button.textContent();
        const testId = await button.getAttribute("data-testid");
        const isVisible = await button.isVisible();
        logger.info(`Button ${i}: class="${buttonClass}", text="${buttonText}", testid="${testId}", visible="${isVisible}"`);
      }
      
      // Try different approaches to find the delete button
      let deleteButton = null;
      
      // Approach 1: Try the original selector
      try {
        deleteButton = this.deleteButtonOnNode(categoryName);
        await deleteButton.waitFor({ state: "visible", timeout: 5000 });
        logger.info("Found delete button using original selector");
      } catch (error) {
        logger.info("Original delete button selector failed, trying alternatives");
      }
      
      // Approach 2: Try by data-testid
      if (!deleteButton || !(await deleteButton.isVisible())) {
        try {
          deleteButton = categoryNode.locator('[data-testid="button-delete"]');
          await deleteButton.waitFor({ state: "visible", timeout: 5000 });
          logger.info("Found delete button using data-testid");
        } catch (error) {
          logger.info("Delete button by data-testid not found");
        }
      }
      
      // Approach 3: Try by button text
      if (!deleteButton || !(await deleteButton.isVisible())) {
        try {
          deleteButton = categoryNode.locator('button:has-text("Delete")');
          await deleteButton.waitFor({ state: "visible", timeout: 5000 });
          logger.info("Found delete button using text selector");
        } catch (error) {
          logger.info("Delete button by text not found");
        }
      }
      
      // Approach 4: Try by specific danger button pattern
      if (!deleteButton || !(await deleteButton.isVisible())) {
        try {
          deleteButton = categoryNode.locator('button.el-button--danger, button[class*="danger"]');
          await deleteButton.waitFor({ state: "visible", timeout: 5000 });
          logger.info("Found delete button using danger class selector");
        } catch (error) {
          logger.info("Delete button by danger class not found");
        }
      }
      
      // Approach 5: Try right-click context menu (if delete is in context menu)
      if (!deleteButton || !(await deleteButton.isVisible())) {
        logger.info("Trying right-click context menu approach");
        await categoryNode.click({ button: "right" });
        await this.page.waitForTimeout(1000);
        
        try {
          deleteButton = this.page.locator('[data-testid="context-menu-delete"], .context-menu button:has-text("Delete")');
          await deleteButton.waitFor({ state: "visible", timeout: 5000 });
          logger.info("Found delete button in context menu");
        } catch (error) {
          logger.info("Delete button in context menu not found");
        }
      }
      
      if (!deleteButton || !(await deleteButton.isVisible())) {
        throw new Error(`Could not find delete button for category: ${categoryName}`);
      }
      
      // Click the delete button
      await deleteButton.click({ timeout: this.actionTimeout });
      logger.info(`Clicked delete button for category: ${categoryName}`);
      
      // Wait a moment for any animations/transitions
      await this.page.waitForTimeout(1000);
      
      // Debug: Check what happened after clicking delete button
      logger.info("Debugging page state after delete button click...");
      
      // Try different selectors for the confirmation dialog
      const possibleDialogSelectors = [
        ".el-dialog__wrapper",
        ".el-dialog",
        "[data-testid='delete-confirmation-dialog']",
        "[data-testid='confirmation-dialog']", 
        ".confirmation-dialog",
        ".delete-dialog",
        ".modal",
        ".el-message-box",
        ".el-overlay"
      ];
      
      let foundDialogSelector = null;
      for (const selector of possibleDialogSelectors) {
        try {
          const elements = this.page.locator(selector);
          const count = await elements.count();
          logger.info(`Dialog selector "${selector}": found ${count} elements`);
          
          if (count > 0) {
            // Check if any of these elements are visible
            for (let i = 0; i < count; i++) {
              const element = elements.nth(i);
              const isVisible = await element.isVisible();
              const text = await element.textContent();
              logger.info(`  Element ${i}: visible=${isVisible}, text="${text?.substring(0, 100)}..."`);
              
              if (isVisible) {
                foundDialogSelector = selector;
                break;
              }
            }
            if (foundDialogSelector) break;
          }
        } catch (error) {
          logger.info(`Dialog selector "${selector}": error - ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      if (!foundDialogSelector) {
        // Take a screenshot to see what's on the page
        await this.page.screenshot({ path: 'debug-after-delete-click.png', fullPage: true });
        logger.error("No confirmation dialog found after delete button click. Screenshot saved as debug-after-delete-click.png");
        
        // Check if there are any error messages or notifications
        const errorSelectors = [".el-message--error", ".el-notification--error", ".error-message"];
        for (const errorSelector of errorSelectors) {
          try {
            const errorElements = this.page.locator(errorSelector);
            const errorCount = await errorElements.count();
            if (errorCount > 0) {
              for (let i = 0; i < errorCount; i++) {
                const errorText = await errorElements.nth(i).textContent();
                logger.error(`Error message found: "${errorText}"`);
              }
            }
          } catch (error) {
            // Ignore errors when checking for error messages
          }
        }
        
        throw new Error("Delete confirmation dialog did not appear after clicking delete button");
      }
      
      logger.info(`Using dialog selector: ${foundDialogSelector}`);
      
      // Wait for the confirmation dialog to be fully visible
      await this.page.waitForSelector(foundDialogSelector, {
        state: "visible",
        timeout: this.actionTimeout,
      });
      logger.info(`Delete dialog opened successfully for: ${categoryName}`);
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
