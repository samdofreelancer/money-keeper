import { Page } from "@playwright/test";
import { BasePage } from "../../../../shared/infrastructure/pages/base.page";

export class CategoryCreationPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }

  private async fillCategoryForm(name: string, icon: string, type: string): Promise<void> {
    await this.page.getByTestId("add-category-button").click();
    await this.page.getByTestId("input-category-name").click();
    await this.page.getByTestId("input-category-name").fill(name);
    this.logger.info(`Filled category name: ${name}`);
    await this.page.getByTestId("select-icon").locator("div").nth(3).click();
    this.logger.info(`Selected icon: ${icon}`);
    await this.page.getByRole("option", { name: "Grid" }).click();
    this.logger.info(`Selected type: ${type}`);
  }

  private async selectParentCategory(parent: string): Promise<void> {
    this.logger.info(`Setting parent category: ${parent}`);
    await this.page.getByTestId("select-parent-category").click();
    this.logger.info("Parent category dropdown opened");
    const parentOption = this.page.getByRole("option", { name: parent });
    await parentOption.waitFor({ state: "visible", timeout: 10000 });
    this.logger.info(`Parent option '${parent}' is visible`);
    await parentOption.click();
    this.logger.info(`Selected parent category: ${parent}`);
  }

  private async submitCategory(expectError: boolean): Promise<string | void> {
    if (expectError) {
      this.logger.info(`Submit category with expect error`);
      this.logger.info(`Wait for a failed POST /categories response (status 400-499)`);
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
      this.logger.info(
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
      this.logger.info(
        `Category created successfully with id: ${data.id}`
      );
      return data.id;
    }
  }

  async createCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    expectError = false
  ): Promise<string | void> {
    try {
      this.logger.info(
        `Creating category with name: ${name}, icon: ${icon}, type: ${type}, parent: ${parent}, expectError: ${expectError}`
      );
      await this.fillCategoryForm(name, icon, type);
      if (parent) {
        await this.selectParentCategory(parent);
      }
      this.logger.info(`Submitting category creation for: ${name}`);
      const result = await this.submitCategory(expectError);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create category ${name}: ${error}`);
      throw error;
    }
  }
}
