import { Page } from "@playwright/test";

import { BasePage } from "../../../../shared/infrastructure/pages/base.page";
import { CategoryUiPort } from "../../domain/ports/category-ui.port";
import { logger } from "../../../../support/logger";

export class CategoryPage extends BasePage implements CategoryUiPort {
  constructor(public page: Page) {
    super(page);
  }

  async navigateToCategoryPage(): Promise<void> {
    // Use full URL or base URL from environment config
    const baseUrl = process.env.BASE_URL || "http://localhost:5173";
    await this.page.goto(`${baseUrl}/categories`);
  }

  async createCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string
  ): Promise<string> {
    try {
      logger.info(
        `Creating unique category with name: ${name}, icon: ${icon}, type: ${type}, parent: ${parent}`
      );

      await this.page.getByTestId("add-category-button").click();

      logger.info(
        `Creating category with name: ${name}, icon: ${icon}, type: ${type}, parent: ${parent}`
      );
      await this.page.getByTestId("input-category-name").click();
      await this.page.getByTestId("input-category-name").fill(name);
      logger.info(`Filled category name: ${name}`);

      await this.page.getByTestId("select-icon").locator("div").nth(3).click();
      logger.info(`Selected icon: ${icon}`);
      await this.page.getByRole("option", { name: "Grid" }).click();
      logger.info(`Selected type: ${type}`);
      if (parent) {
        logger.info(`Setting parent category: ${parent}`);
        // Click the dropdown to open parent selection
        await this.page.getByTestId("select-parent-category").click();
        logger.info("Parent category dropdown opened");
        // Wait for the parent option to be visible and enabled
        const parentOption = this.page.getByRole("option", { name: parent });
        await parentOption.waitFor({ state: "visible", timeout: 10000 });
        logger.info(`Parent option '${parent}' is visible`);
        await parentOption.click();
        logger.info(`Selected parent category: ${parent}`);
      }
      logger.info(`Submitting category creation for: ${name}`);

      // Intercept the API response for category creation
      const [response] = await Promise.all([
        this.page.waitForResponse(
          (resp) =>
            resp.url().includes("/categories") &&
            resp.request().method() === "POST" &&
            resp.status() === 201
        ),
        this.page.getByTestId("button-submit").click(),
      ]);

      const data = await response.json();
      logger.info(`Category ${name} created successfully with id: ${data.id}`);
      return data.id;
    } catch (error) {
      logger.error(`Failed to create category ${name}: ${error}`);
      throw error;
    }
  }

  async createUniqueCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string
  ): Promise<string> {
    const uniqueName = `${name}-${Date.now()}`;
    return await this.createCategory(uniqueName, icon, type, parent);
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

  async createCategoryWithDuplicateName(
    name: string,
    icon: string,
    type: string
  ): Promise<void> {
    await this.createCategory(name, icon, type);
  }

  async updateCategoryParent(
    categoryName: string,
    newParentName: string
  ): Promise<void> {
    await this.page.click(`text=${categoryName}`);
    await this.page.getByTestId("select-parent-category").click();
    const parentOptions = await this.page.$$('[data-testid="option-parent-category"]');
    let found = false;
    for (const option of parentOptions) {
      const text = await option.textContent();
      if (text?.trim() === newParentName) {
        await option.click();
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`Parent category option '${newParentName}' not found in dropdown.`);
    }
    await this.page.getByTestId("button-update-category").click();
  }

  async deleteCategory(name: string): Promise<void> {
    await this.page.click(`text=${name}`);
    await this.page.click("button#delete-category");
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    const errorElements = await this.page.$$(".el-form-item__error");
    for (const el of errorElements) {
      const text = await el.textContent();
      if (text?.trim() === message) {
        return true;
      }
    }
    return false;
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

  async updateCategoryNameAndIcon(
    oldName: string,
    newName: string,
    newIcon: string
  ): Promise<void> {
    // Click the category to edit
    await this.page.click(`text=${oldName}`);
    // Fill new name
    await this.page.getByTestId("input-category-name").fill(newName);
    // Select new icon (assuming icon picker is accessible by test id and icon name)
    await this.page.getByTestId("select-icon").click();
    await this.page.getByRole("option", { name: newIcon }).click();
    // Save changes
    await this.page.getByTestId("button-submit").click();
  }

  async assertOnCategoryPage(): Promise<void> {
    const url = this.page.url();
    logger.info(`url: ${url}`);

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

  async attemptCreateCategoryExpectingFailure(
    name: string,
    icon: string,
    type: string,
    parent?: string
  ): Promise<void> {
    await this.page.getByTestId("add-category-button").click();
    await this.page.getByTestId("input-category-name").fill(name);
    await this.page.getByTestId("select-icon").locator("div").nth(3).click();
    await this.page.getByRole("option", { name: "Grid" }).click();
    // Fill type and parent if needed (add logic as per your UI)
    if (parent) {
      await this.page.getByTestId("select-parent-category").click();
      const parentOptions = await this.page.$$('[data-testid="option-parent-category"]');
      let found = false;
      for (const option of parentOptions) {
        const text = await option.textContent();
        if (text?.trim() === parent) {
          await option.click();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Parent category option '${parent}' not found in dropdown.`);
      }
    }
    await this.page.getByTestId("button-submit").click();
    // Do NOT wait for a successful response, just return
  }
}
