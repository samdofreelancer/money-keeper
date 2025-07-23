import { Page } from "@playwright/test";
import { BasePage } from "../../../../shared/infrastructure/pages/base.page";

interface CreateCategoryParams {
  name: string;
  icon: string;
  type: string;
  parent?: string;
  expectError?: boolean;
}

export class CategoryCreationPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }

  private async fillCategoryForm(name: string, icon: string, type: string): Promise<void> {
    await this.page.getByTestId("add-category-button").click();
    await this.page.getByTestId("input-category-name").click();
    await this.page.getByTestId("input-category-name").fill(name);
    this.logger.info(`Filled category name: ${name}`);

    // Select icon dynamically by matching icon name or attribute
    const iconOption = this.page.getByTestId("select-icon").locator(`div[aria-label="${icon}"]`);
    if ((await iconOption.count()) === 0) {
      this.logger.warn(`Icon option '${icon}' not found, selecting default icon`);
      await this.page.getByTestId("select-icon").locator("div").first().click();
    } else {
      await iconOption.click();
      this.logger.info(`Selected icon: ${icon}`);
    }

    // Select type dynamically by role option name matching the type parameter
    const typeOption = this.page.getByRole("option", { name: type });
    if ((await typeOption.count()) === 0) {
      this.logger.warn(`Type option '${type}' not found, selecting default type 'Grid'`);
      await this.page.getByRole("option", { name: "Grid" }).click();
    } else {
      await typeOption.click();
      this.logger.info(`Selected type: ${type}`);
    }
  }

  private async selectParentCategory(parent: string): Promise<void> {
    this.logger.info(`Setting parent category: ${parent}`);
    await this.page.getByTestId("select-parent-category").click();

    const parentOption = this.page.getByRole("option", { name: parent });
    try {
      await parentOption.waitFor({ state: "visible", timeout: 10000 });
      this.logger.info(`Parent option '${parent}' is visible`);
      await parentOption.click();
      this.logger.info(`Selected parent category: ${parent}`);
    } catch (error) {
      this.logger.error(`Parent category option '${parent}' not found or not visible: ${error}`);
      throw new Error(`Parent category option '${parent}' not found or not visible`);
    }
  }

  private async submitCategoryExpectError(): Promise<void> {
    this.logger.info(`Submitting category creation expecting error`);
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
    this.logger.info(`Received expected error response: status ${response.status()}`);
  }

  private async submitCategoryExpectSuccess(): Promise<string> {
    this.logger.info(`Submitting category creation expecting success`);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.url().includes("/categories") &&
          resp.request().method() === "POST" &&
          resp.status() === 201
      ),
      this.page.getByTestId("button-submit").click(),
    ]);
    if (!response.ok()) {
      const status = response.status();
      this.logger.error(`Unexpected response status: ${status}`);
      throw new Error(`Category creation failed with status ${status}`);
    }
    const data = await response.json();
    this.logger.info(`Category created successfully with id: ${data.id}`);
    return data.id;
  }

  async createCategory(params: CreateCategoryParams): Promise<string | void> {
    const { name, icon, type, parent, expectError = false } = params;
    try {
      this.logger.info(
        `Creating category with name: ${name}, icon: ${icon}, type: ${type}, parent: ${parent}, expectError: ${expectError}`
      );
      await this.fillCategoryForm(name, icon, type);
      if (parent) {
        await this.selectParentCategory(parent);
      }
      this.logger.info(`Submitting category creation for: ${name}`);
      if (expectError) {
        await this.submitCategoryExpectError();
        return;
      } else {
        const result = await this.submitCategoryExpectSuccess();
        return result;
      }
    } catch (error) {
      this.logger.error(`Failed to create category ${name}: ${error}`);
      throw error;
    }
  }
}
