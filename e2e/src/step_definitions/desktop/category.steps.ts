import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { generateUniqueName } from "../../utils/testDataHelper";
import { getAllCategories, createCategory } from "../../api/categoryApiHelper";
import { CategoryPage } from "../../pages/category.page";
import { config } from "../../config/env.config";
import { logger } from "../../support/logger";
import { CustomWorld } from "../../support/world";

// Extend the Window interface to include __browserConsoleErrors
declare global {
  interface Window {
    __browserConsoleErrors?: any[];
  }
}

Given(
  "a {string} category exists",
  async function (this: CustomWorld, categoryName: string) {
      logger.info(`generateUniqueName category with name: ${categoryName}`);
      const uniqueName = generateUniqueName(categoryName);
      logger.info(`Unique category name generated: ${uniqueName}`);
      this.uniqueData.set(categoryName, uniqueName);
      const newCategory = await createCategory({
        name: uniqueName,
        icon: "Grid",
        type: "EXPENSE",
        parentId: null,
      });
      if (!this.createdCategoryIds) {
        this.createdCategoryIds = [];
      }
      this.createdCategoryIds.push(newCategory.id);
      this.createdCategoryNames = this.createdCategoryNames || [];
      this.createdCategoryNames.push(uniqueName);
      logger.info(`Created category with unique name: ${this.createdCategoryNames}`);
  }
);

Given(
  "a {string} category of type {string} exists",
  async function (
    this: CustomWorld,
    categoryName: string,
    categoryType: "INCOME" | "EXPENSE"
  ) {
    const uniqueName = generateUniqueName(categoryName);
    this.uniqueData.set(categoryName, uniqueName);
    const newCategory = await createCategory({
      name: uniqueName,
      icon: "Grid",
      type: categoryType,
      parentId: null,
    });

    if (!this.createdCategoryIds) {
      this.createdCategoryIds = [];
    }
    this.createdCategoryIds.push(newCategory.id);
  }
);

Given("I open the homepage", async function (this: CustomWorld) {
  await this.page.goto(config.browser.baseUrl);
});

When("I navigate to the Categories page", async function (this: CustomWorld) {
  await this.categoryPage!.navigateToCategories();
});

Then("I should see a list of categories", async function (this: CustomWorld) {
  // Fetch categories from backend API
  const categories = await getAllCategories();
  logger.info(`Fetched ${categories.length} categories from backend.`);

  // Wait for loading overlay to disappear
  await this.page.waitForSelector('[data-testid="loading-overlay"]', { state: 'detached', timeout: 5000 });

  // Verify the UI shows the categories fetched from backend
  const uiCount = await this.categoryPage!.getCategoryCount();
  expect(uiCount).toBe(categories.length);

  // Optionally, verify category names in UI match API data
  for (const category of categories) {
    const isPresent = await this.categoryPage!.isCategoryPresent(category.name);
    expect(isPresent).toBe(true);
  }
});

When("I open the create category dialog", async function (this: CustomWorld) {
  await this.categoryPage!.openCreateCategoryDialog();
});

When(
  "I fill in the category form with valid data {string}, {string}, {string}, {string}",
  async function (
    this: CustomWorld,
    categoryName: string,
    icon: string,
    categoryType: string,
    parentCategory: string
  ) {
    // Use uniqueData if available (for duplicate scenarios), else fallback to createdCategoryNames or generate unique
    const uniqueName = this.uniqueData.get(categoryName) ||
      (this.createdCategoryNames
        ? this.createdCategoryNames.find(name => name === categoryName) || categoryName
        : generateUniqueName(categoryName));
    logger.info(`Filling category form with test data: ${uniqueName}, ${icon}, ${categoryType}, ${parentCategory}`);
    // Store the unique name in the context for later use
    this.uniqueData.set(categoryName, uniqueName);
    // Convert "None" to empty string for parentCategory to satisfy string type
    const parentCat = parentCategory === "None" ? "" : parentCategory;
    await this.categoryPage!.fillCategoryForm(
      uniqueName,
      icon,
      categoryType,
      parentCat
    );
    // Store created category names in World context for cleanup
    if (!this.createdCategoryIds) {
      this.createdCategoryIds = [];
    }
    // We are creating via UI here, so we don't have the ID.
    // We will rely on the after hook to fetch and delete by name.
    if (!this.createdCategoryNames) {
      this.createdCategoryNames = [];
    }
    this.createdCategoryNames.push(uniqueName);
  }
);

When("I submit the category form", async function (this: CustomWorld) {
  await this.categoryPage!.submitForm();
});

When("I click the submit button", async function (this: CustomWorld) {
  await this.categoryPage!.clickSubmit();
});

Then(
  "I should see the new category in the list {string}",
  async function (this: CustomWorld, categoryName: string) {
    const uniqueName = this.uniqueData.get(categoryName) ?? categoryName;
    const isPresent = await this.categoryPage!.isCategoryPresent(uniqueName);
    expect(isPresent).toBe(true);
  }
);

// New step definitions added below

When(
  "I open the edit category dialog for {string}",
  async function (this: CustomWorld, categoryName: string) {
    const uniqueName = this.uniqueData.get(categoryName) ?? categoryName;
    await this.categoryPage!.openEditCategoryDialog(uniqueName);
  }
);

When(
  "I open the delete category dialog for {string}",
  async function (this: CustomWorld, categoryName: string) {
    const uniqueName = this.uniqueData.get(categoryName) ?? categoryName;
    await this.categoryPage!.openDeleteCategoryDialog(uniqueName);
  }
);

When("I confirm the delete action", async function (this: CustomWorld) {
  await this.categoryPage!.confirmDelete();
});

When(
  "I search categories with query {string}",
  async function (this: CustomWorld, query: string) {
    await this.categoryPage!.searchCategories(query);
  }
);

When(
  "I filter categories by tab {string}",
  async function (this: CustomWorld, tabName: string) {
    await this.categoryPage!.filterByTab(tabName);
  }
);

Then(
  "I should not see category {string} in the list",
  async function (this: CustomWorld, categoryName: string) {
    const uniqueName = this.uniqueData.get(categoryName) ?? categoryName;
    const isPresent = await this.categoryPage!.isCategoryPresent(uniqueName);
    expect(isPresent).toBe(false);
  }
);

Then(
  "I should see category {string} in the list",
  async function (this: CustomWorld, categoryName: string) {
    const uniqueName = this.uniqueData.get(categoryName) ?? categoryName;
    const isPresent = await this.categoryPage!.isCategoryPresent(uniqueName);
    expect(isPresent).toBe(true);
  }
);

When("I clear the category name field", async function (this: CustomWorld) {
  await this.categoryPage!.clearCategoryNameField();
});

Then(
  "I should see the updated category in the list {string}",
  async function (this: CustomWorld, categoryName: string) {
    const uniqueName = this.uniqueData.get(categoryName) ?? categoryName;
    const isPresent = await this.categoryPage!.isCategoryPresent(uniqueName);
    expect(isPresent).toBe(true);
  }
);

Then(
  "I should see a validation error message {string}",
  async function (this: CustomWorld, message: string) {
    // Use locator that matches exact error message text
    const errorMessageLocator = this.page.locator('.el-form-item__error', { hasText: message });
    try {
      await errorMessageLocator.waitFor({ state: "visible", timeout: 5000 });
    } catch (e) {
      throw e;
    }
    expect(await errorMessageLocator.count()).toBeGreaterThan(0);
  }
);

When("I cancel the category form", async function (this: CustomWorld) {
  await this.categoryPage!.cancelCategoryForm();
});

When("I cancel the delete action", async function (this: CustomWorld) {
  await this.categoryPage!.cancelDelete();
});
