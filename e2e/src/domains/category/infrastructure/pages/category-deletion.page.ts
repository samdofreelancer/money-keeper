import { Page } from "@playwright/test";

import { BasePage } from "../../../../shared/infrastructure/pages/base.page";

export class CategoryDeletionPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }

  async deleteCategory(name: string): Promise<void> {
    this.logger.info(`Start delete category: ${name}`);
    // Find the row/container that contains the category name
    const categoryRow = this.page.locator('[data-testid="tree-node-content"]', {
      has: this.page.getByTestId("category-name").filter({ hasText: name }),
    });
    // Find the delete button within that row
    this.logger.info(`Find the delete button within that row: ${categoryRow}`);
    const deleteButton = categoryRow.getByTestId("delete-category-button");
    await deleteButton.click();
    this.logger.info(`Confirming delete category`);
    await this.page.getByTestId("button-confirm-delete").click();
    this.logger.info(`Confirmed delete category`);
    this.logger.info(`End delete category: ${name}`);
  }
}
