import { Page, Locator } from "@playwright/test";

import { CategoryFormData } from "../types/CategoryTypes";
import { logger } from "../support/logger";
import { config } from "../config/env.config";

/**
 * UI Actions for category operations
 * Encapsulates all UI interactions following the Command pattern
 */
export class CategoryUIActions {
  private page: Page;
  private actionTimeout: number;

  constructor(page: Page) {
    this.page = page;
    this.actionTimeout = config.browser.actionTimeout || 10000;
  }

  /**
   * Opens the create category dialog
   */
  async openCreateDialog(): Promise<void> {
    const addButton = this.page.locator('[data-testid="add-category-button"]');
    await addButton.click();

    const categoryForm = this.page.locator('[data-testid="category-form"]');
    await categoryForm.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });

    logger.info("Create category dialog opened");
  }

  /**
   * Opens the edit category dialog
   */
  async openEditDialog(categoryName: string): Promise<void> {
    const categoryNode = this.getCategoryNode(categoryName);
    await categoryNode.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });

    const editButton = categoryNode
      .locator("button.el-button--primary")
      .first();
    await editButton.click({ timeout: this.actionTimeout });

    const categoryForm = this.page.locator('[data-testid="category-form"]');
    await categoryForm.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });

    logger.info(`Edit dialog opened for category: ${categoryName}`);
  }

  /**
   * Opens the delete confirmation dialog
   */
  async openDeleteDialog(categoryName: string): Promise<void> {
    const categoryNode = this.getCategoryNode(categoryName);
    await categoryNode.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
    await categoryNode.hover();

    const deleteButton = categoryNode
      .locator("button.el-button--danger")
      .first();
    await deleteButton.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
    await deleteButton.click({ timeout: this.actionTimeout });

    await this.waitForDeleteConfirmationDialog();
    logger.info(`Delete dialog opened for category: ${categoryName}`);
  }

  /**
   * Fills the category form with provided data
   */
  async fillForm(categoryData: CategoryFormData): Promise<void> {
    // Fill name
    const nameInput = this.page.locator('[data-testid="input-category-name"]');
    await nameInput.fill(categoryData.name);

    // Select icon
    await this.selectIcon(categoryData.icon);

    // Select type
    await this.selectType(categoryData.type);

    // Select parent category if provided
    if (categoryData.parentCategory && categoryData.parentCategory !== "None") {
      await this.selectParentCategory(categoryData.parentCategory);
    }

    logger.info(`Form filled for category: ${categoryData.name}`);
  }

  /**
   * Submits the category form
   */
  async submitForm(): Promise<void> {
    const submitButton = this.page.locator('[data-testid="button-submit"]');
    await submitButton.click({ timeout: this.actionTimeout });

    // Wait for form to close or success message
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
      logger.info("Form submitted successfully");
    } catch (error) {
      // Verify if dialog actually closed despite timeout
      const dialogHidden = await this.page
        .locator(".el-dialog__wrapper")
        .isHidden();
      if (dialogHidden) {
        logger.info("Form submission completed without success message");
      } else {
        logger.error("Form submission may have failed - dialog still visible");
        throw new Error("Form submission failed");
      }
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * Confirms the delete operation
   */
  async confirmDelete(): Promise<void> {
    const confirmButton = this.page.locator(
      '[data-testid="button-confirm-delete"]'
    );
    await confirmButton.click();

    await this.page.waitForSelector(".el-dialog__wrapper", {
      state: "hidden",
      timeout: this.actionTimeout,
    });

    logger.info("Delete confirmed");
  }

  /**
   * Cancels the current operation
   */
  async cancelCurrentOperation(): Promise<void> {
    try {
      // Try multiple cancel button selectors
      const cancelSelectors = [
        '[data-testid="button-cancel"]',
        ".el-dialog__footer .el-button--default",
        '.el-button:has-text("Cancel")',
        '.el-button:has-text("取消")', // Chinese cancel
        ".el-message-box__btns .el-button--default",
      ];

      let cancelButton = null;
      for (const selector of cancelSelectors) {
        const element = this.page.locator(selector);
        if (await element.isVisible()) {
          cancelButton = element;
          break;
        }
      }

      if (!cancelButton) {
        // Try ESC key to close dialog
        await this.page.keyboard.press("Escape");
        await this.page.waitForTimeout(1000);
        logger.info("Operation cancelled via ESC key");
        return;
      }

      await cancelButton.click({ timeout: this.actionTimeout });

      // Wait for dialog to close
      await this.page.waitForSelector(".el-dialog__wrapper", {
        state: "hidden",
        timeout: this.actionTimeout,
      });

      logger.info("Operation cancelled");
    } catch (error) {
      // If no dialog is open, just continue
      logger.info("No dialog to cancel or already closed");
    }
  }

  /**
   * Searches for categories by term
   */
  async searchByTerm(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });

    await searchInput.clear();
    await searchInput.fill(searchTerm);

    await this.page.waitForTimeout(2000); // Wait for search filtering

    logger.info(`Search performed for term: ${searchTerm}`);
  }

  /**
   * Filters categories by type
   */
  async filterByType(categoryType: string): Promise<void> {
    const tabLocator = this.page.locator(
      `[role="tab"][aria-controls="pane-${categoryType.toLowerCase()}"]`
    );
    await tabLocator.click({ timeout: this.actionTimeout });

    await this.page.waitForSelector('[data-testid="category-tree"]', {
      timeout: this.actionTimeout,
    });

    logger.info(`Filtered by category type: ${categoryType}`);
  }

  private async selectIcon(icon: string): Promise<void> {
    const iconSelect = this.page.locator(
      'div.el-form-item:has(label:has-text("Icon")) .el-select'
    );
    await iconSelect.click({ timeout: this.actionTimeout });

    const iconOption = this.page.locator(
      `.el-select-dropdown__item:has-text("${icon}")`
    );
    await iconOption.waitFor({ state: "visible", timeout: this.actionTimeout });
    await iconOption.click({ timeout: this.actionTimeout });
  }

  private async selectType(categoryType: string): Promise<void> {
    const typeRadio = this.page.locator(
      `label.el-radio-button:has(input[value="${categoryType}"])`
    );
    await typeRadio.waitFor({ state: "visible", timeout: this.actionTimeout });
    await typeRadio.click({ timeout: this.actionTimeout });
  }

  private async selectParentCategory(parentCategory: string): Promise<void> {
    const parentSelect = this.page.locator(
      'div.el-form-item:has(label:has-text("Parent Category")) .el-select'
    );
    await parentSelect.click({ timeout: this.actionTimeout });

    const parentOption = this.page.locator(
      `.el-select-dropdown__item:has-text("${parentCategory}")`
    );
    await parentOption.waitFor({
      state: "visible",
      timeout: this.actionTimeout,
    });
    await parentOption.click({ timeout: this.actionTimeout });
  }

  private getCategoryNode(categoryName: string): Locator {
    return this.page.locator(".category-tree .tree-node-content", {
      hasText: categoryName,
    });
  }

  private async waitForDeleteConfirmationDialog(): Promise<void> {
    const dialogSelectors = [
      ".el-dialog__wrapper",
      ".el-dialog",
      ".el-message-box",
      ".modal",
    ];

    for (const selector of dialogSelectors) {
      try {
        await this.page.waitForSelector(selector, {
          state: "visible",
          timeout: 5000,
        });
        return;
      } catch (error) {
        // Continue to next selector
      }
    }

    throw new Error("Delete confirmation dialog not found");
  }
}
