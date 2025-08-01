import { Page } from "@playwright/test";

import { BasePage } from "../../../../shared/infrastructure/pages/base.page";

export class CategoryListingPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }

  async listCategories(): Promise<string[]> {
    const categoryElements = await this.page.$$("[data-test=category-name]");
    const categories = [];
    for (const element of categoryElements) {
      const text = await element.textContent();
      if (text) {
        categories.push(text.trim());
      }
    }
    return categories;
  }

  async isCategoryCreated(name: string): Promise<boolean> {
    return await this.page.isVisible(`text=${name}`);
  }

  async isCategoryChildOf(
    childName: string,
    parentName: string
  ): Promise<boolean> {
    // Implement logic to verify if childName is under parentName in the UI
    const childElement = await this.page.$(`text=${childName}`);
    if (!childElement) return false;
    const parentElement = await this.page.$(`text=${parentName}`);
    if (!parentElement) return false;
    // Check if child element is nested under parent element in the DOM
    const parentBox = await parentElement.boundingBox();
    const childBox = await childElement.boundingBox();
    if (!parentBox || !childBox) return false;
    // Simple check: child should be visually below parent and horizontally aligned
    return childBox.y > parentBox.y && Math.abs(childBox.x - parentBox.x) < 50;
  }

  async assertOnCategoryPage(): Promise<void> {
    const url = this.page.url();
    this.logger.info(`url: ${url}`);

    if (!(await url).includes("/categories")) {
      throw new Error("User is not on the Category Management page");
    }
    // Wait for network to be idle
    await this.page.waitForLoadState("networkidle");
    // Wait for loading overlay to disappear if it exists
    try {
      await this.page.waitForSelector("[data-test=loading-overlay]", {
        state: "detached",
        timeout: 5000,
      });
    } catch (e) {
      // If overlay never appears, that's fine
    }
    const isVisible = await this.page.isVisible(
      "[data-testid=add-category-button]"
    );
    if (!isVisible) {
      throw new Error("Category Management page did not load correctly");
    }
  }
}
