import { Page } from "@playwright/test";

import { BasePage } from "../../../../shared/infrastructure/pages/base.page";
import {
  CategoryFormComponent,
  CategoryFormParams,
} from "./category-form.component";

interface CreateCategoryParams extends CategoryFormParams {
  expectError?: boolean;
}

export class CategoryCreationPage extends BasePage {
  private categoryForm: CategoryFormComponent;

  constructor(public page: Page) {
    super(page);
    this.categoryForm = new CategoryFormComponent(page);
  }

  async createCategory(params: CreateCategoryParams): Promise<string | void> {
    const { name, icon, type, parent, expectError = false } = params;
    try {
      this.logger.info(
        `Creating category with name: ${name}, icon: ${icon}, type: ${type}, parent: ${parent}, expectError: ${expectError}`
      );
      await this.page.getByTestId("add-category-button").click();
      await this.categoryForm.fillCategoryForm(name, icon, type);
      if (parent) {
        await this.categoryForm.selectParentCategory(parent);
      }
      this.logger.info(`Submitting category creation for: ${name}`);
      if (expectError) {
        await this.categoryForm.submitCategoryExpectError();
        return;
      } else {
        const result = await this.categoryForm.submitCategoryExpectSuccess();
        return result;
      }
    } catch (error) {
      this.logger.error(`Failed to create category ${name}: ${error}`);
      throw error;
    }
  }
}
