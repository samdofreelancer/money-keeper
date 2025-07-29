import { Page } from "@playwright/test";

import { BasePage } from "../../../../shared/infrastructure/pages/base.page";
import { CategoryUiPort } from "../../domain/ports/category-ui.port";
import { CategoryCreationPage } from "./category-creation.page";
import { CategoryUpdatingPage } from "./category-updating.page";
import { CategoryDeletionPage } from "./category-deletion.page";
import { CategoryListingPage } from "./category-listing.page";
import { UiFeedbackHelper } from "./category-ui-feedback.helper";

const CATEGORY_PATH = "/categories";

export class CategoryUiDriver extends BasePage implements CategoryUiPort {
  private readonly categoryUrl: string;
  private categoryCreationPage: CategoryCreationPage;
  private categoryUpdatingPage: CategoryUpdatingPage;
  private categoryDeletionPage: CategoryDeletionPage;
  private categoryListingPage: CategoryListingPage;
  private uiFeedbackHelper: UiFeedbackHelper;

  constructor(public page: Page) {
    super(page);
    this.categoryUrl = this.baseUrl + CATEGORY_PATH;
    this.categoryCreationPage = new CategoryCreationPage(page);
    this.categoryUpdatingPage = new CategoryUpdatingPage(page);
    this.categoryDeletionPage = new CategoryDeletionPage(page);
    this.categoryListingPage = new CategoryListingPage(page);
    this.uiFeedbackHelper = new UiFeedbackHelper(this.page);
  }

  async navigateToCategoryPage(): Promise<void> {
    try {
      await this.page.goto(this.categoryUrl);
    } catch (error) {
      this.logger.error(`Failed to navigate to Category page: ${error}`);
      throw error;
    }
  }

  async createCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    expectError = false
  ): Promise<string | void> {
    return await this.categoryCreationPage.createCategory({
      name,
      icon,
      type,
      parent,
      expectError,
    });
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
    return await this.categoryListingPage.isCategoryCreated(name);
  }

  async isCategoryChildOf(
    childName: string,
    parentName: string
  ): Promise<boolean> {
    return await this.categoryListingPage.isCategoryChildOf(
      childName,
      parentName
    );
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
    await this.categoryUpdatingPage.updateCategoryParent(
      categoryName,
      newParentName
    );
  }

  async deleteCategory(name: string): Promise<void> {
    await this.categoryDeletionPage.deleteCategory(name);
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    return await this.uiFeedbackHelper.isErrorMessageVisible(message);
  }

  async isToastMessageVisible(message: string): Promise<boolean> {
    return await this.uiFeedbackHelper.isToastMessageVisible(message);
  }

  async waitForToastMessage(message: string, timeout = 5000): Promise<boolean> {
    return await this.uiFeedbackHelper.waitForToastMessage(message, timeout);
  }

  async listCategories(): Promise<string[]> {
    return await this.categoryListingPage.listCategories();
  }

  async updateCategoryNameAndIcon(
    oldName: string,
    newName: string,
    newIcon: string
  ): Promise<void> {
    await this.categoryUpdatingPage.updateCategoryNameAndIcon(
      oldName,
      newName,
      newIcon
    );
  }

  async assertOnCategoryPage(): Promise<void> {
    await this.categoryListingPage.assertOnCategoryPage();
  }

  async isErrorMessageVisibleInErrorBox(message: string): Promise<boolean> {
    return await this.uiFeedbackHelper.isErrorMessageVisibleInErrorBox(message);
  }

  async reloadCategoryPage(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
  }
}
