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
    parent?: string,
    expectError = false
  ): Promise<string | void> {
    try {
      logger.info(
        `Creating category with name: ${name}, icon: ${icon}, type: ${type}, parent: ${parent}, expectError: ${expectError}`
      );
      await this.page.getByTestId("add-category-button").click();
      await this.page.getByTestId("input-category-name").click();
      await this.page.getByTestId("input-category-name").fill(name);
      logger.info(`Filled category name: ${name}`);
      await this.page.getByTestId("select-icon").locator("div").nth(3).click();
      logger.info(`Selected icon: ${icon}`);
      await this.page.getByRole("option", { name: "Grid" }).click();
      logger.info(`Selected type: ${type}`);
      if (parent) {
        logger.info(`Setting parent category: ${parent}`);
        await this.page.getByTestId("select-parent-category").click();
        logger.info("Parent category dropdown opened");
        const parentOption = this.page.getByRole("option", { name: parent });
        await parentOption.waitFor({ state: "visible", timeout: 10000 });
        logger.info(`Parent option '${parent}' is visible`);
        await parentOption.click();
        logger.info(`Selected parent category: ${parent}`);
      }
      logger.info(`Submitting category creation for: ${name}`);
      if (expectError) {
        logger.info(`Submit category with expect error`);
        logger.info(`Wait for a failed POST /categories response (status 400-499)`);
        const [response] = await Promise.all([
          this.page.waitForResponse(
            (resp) =>
              resp.url().includes("/categories") &&
              resp.request().method() === "POST" &&
              resp.status() >= 400 &&
              resp.status() < 500
          ),
          this.page.getByTestId("button-submit").click(),
        ]);
        logger.info(
          `Received expected error response for category creation: status ${response.status()}`
        );
        return;
      } else {
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
        logger.info(
          `Category ${name} created successfully with id: ${data.id}`
        );
        return data.id;
      }
    } catch (error) {
      logger.error(`Failed to create category ${name}: ${error}`);
      throw error;
    }
  }

  async createUniqueCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    expectError = false
  ): Promise<string | void> {
    const uniqueName = `${name}-${Date.now()}`;
    return await this.createCategory(
      uniqueName,
      icon,
      type,
      parent,
      expectError
    );
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
    logger.info(
      `Starting updateCategoryParent with categoryName: '${categoryName}', newParentName: '${newParentName}'`
    );
    // Ensure on Category Management page
    await this.assertOnCategoryPage();

    // Find the row/container that contains the category name
    const categoryRows = this.page.locator(
      '[data-testid="tree-node-content"]',
      {
        has: this.page
          .getByTestId("category-name")
          .filter({ hasText: categoryName }),
      }
    );
    const rowCount = await categoryRows.count();
    logger.info(
      `[DEBUG] Found ${rowCount} category rows for name: ${categoryName}`
    );
    for (let i = 0; i < rowCount; i++) {
      const rowText = await categoryRows.nth(i).textContent();
      logger.info(`[DEBUG] Row ${i} text:`, rowText);
    }

    // Find the edit button within that row
    const editButtons = categoryRows.getByTestId("edit-category-button");
    const editButtonCount = await editButtons.count();
    logger.info(
      `[DEBUG] Found ${editButtonCount} edit buttons for category: ${categoryName}`
    );
    for (let i = 0; i < editButtonCount; i++) {
      const btnText = await editButtons.nth(i).textContent();
      logger.info(`[DEBUG] Edit button ${i} text:`, btnText);
    }

    // Click the edit button
    await editButtons.first().click();

    // Open the parent dropdown
    await this.page
      .getByTestId("select-parent-category")
      .locator("div")
      .nth(3)
      .click();

    // Select the new parent by name
    await this.page.getByRole("option", { name: newParentName }).click();
    logger.info(`Selected parent "${newParentName}"`);

    // Submit the update and wait for any response (success or error)
    const [putResponse] = await Promise.all([
      this.page.waitForResponse(
        (resp) => {
          const isCategoryPut =
            resp.url().includes("/categories/") &&
            resp.request().method() === "PUT";
          logger.info(
            `Response intercepted: url=${resp.url()}, method=${resp
              .request()
              .method()}, status=${resp.status()}, isCategoryPut=${isCategoryPut}`
          );
          if (isCategoryPut) {
            logger.info(
              `Received PUT response for categories: ${resp.status()} - ${resp.url()}`
            );
          }
          return isCategoryPut;
        },
        { timeout: 10000 }
      ),
      this.page.getByTestId("button-submit").click(),
    ]);

    logger.info(
      `Ending updateCategoryParent with categoryName: '${categoryName}', newParentName: '${newParentName}'`
    );
  }

  async deleteCategory(name: string): Promise<void> {
    logger.info(`Start delete category: ${name}`);
    // Find the row/container that contains the category name
    const categoryRow = this.page.locator('[data-testid="tree-node-content"]', {
      has: this.page.getByTestId("category-name").filter({ hasText: name }),
    });
    // Find the delete button within that row
    logger.info(`Find the delete button within that row: ${categoryRow}`);
    const deleteButton = categoryRow.getByTestId("delete-category-button");
    await deleteButton.click();
    logger.info(`Confirming delete category`);
    await this.page.getByTestId("button-confirm-delete").click();
    logger.info(`Confirmed delete category`);
    logger.info(`End delete category: ${name}`);
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    // First check for form validation errors
    const errorElements = await this.page.$$(".el-form-item__error");
    for (const el of errorElements) {
      const text = await el.textContent();
      if (text?.trim() === message) {
        return true;
      }
    }

    // Then check for Element Plus toast messages
    const toastMessages = await this.page.$$(".el-message--error");
    for (const el of toastMessages) {
      const text = await el.textContent();
      if (text?.trim().includes(message)) {
        return true;
      }
    }

    // Also check for any element with the error message text
    const messageElements = await this.page.$$(`text=${message}`);
    if (messageElements.length > 0) {
      return true;
    }

    return false;
  }

  async isToastMessageVisible(message: string): Promise<boolean> {
    // Wait a bit for toast to appear
    await this.page.waitForTimeout(1000);

    // Check for Element Plus toast messages
    const toastMessages = await this.page.$$(".el-message--error");
    for (const el of toastMessages) {
      const text = await el.textContent();
      if (text?.trim().includes(message)) {
        return true;
      }
    }

    return false;
  }

  async waitForToastMessage(message: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        (msg) => {
          const toastMessages = Array.from(
            document.querySelectorAll(".el-message--error")
          );
          for (const el of toastMessages) {
            if (el.textContent?.includes(msg)) {
              return true;
            }
          }
          return false;
        },
        message,
        { timeout }
      );
      return true;
    } catch (error) {
      return false;
    }
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

  async isErrorMessageVisibleInErrorBox(message: string): Promise<boolean> {
    const errorLocator = this.page.getByTestId("error-message");
    const errorText = await errorLocator.textContent();
    return !!errorText && errorText.includes(message);
  }
}
