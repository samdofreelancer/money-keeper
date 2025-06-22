import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { getAllCategories } from "../../api/categoryApiHelper";
import { CategoryPage } from "../../pages/category.page";
import { config } from "../../config/env.config";
import { logger } from "../../support/logger";
import { CustomWorld } from "../../support/world";

let categoryPage: CategoryPage;

Given(
  "a {string} category exists",
  async function (this: CustomWorld, categoryName: string) {
    await this.page.goto(config.browser.baseUrl);
    categoryPage = new CategoryPage(this.page);
    await categoryPage.openCreateCategoryDialog();
    await categoryPage.fillCategoryForm(
      categoryName,
      "Grid",
      "EXPENSE",
      "None"
    );
    await categoryPage.submitForm();
    if (!this.createdCategoryNames) {
      this.createdCategoryNames = [];
    }
    this.createdCategoryNames.push(categoryName);
  }
);

Given(
  "a {string} category of type {string} exists",
  async function (
    this: CustomWorld,
    categoryName: string,
    categoryType: string
  ) {
    await this.page.goto(config.browser.baseUrl);
    categoryPage = new CategoryPage(this.page);
    await categoryPage.openCreateCategoryDialog();
    await categoryPage.fillCategoryForm(
      categoryName,
      "Grid",
      categoryType,
      "None"
    );
    await categoryPage.submitForm();
    if (!this.createdCategoryNames) {
      this.createdCategoryNames = [];
    }
    this.createdCategoryNames.push(categoryName);
  }
);

Given("I open the homepage", async function (this: CustomWorld) {
  await this.page.goto(config.browser.baseUrl);
  categoryPage = new CategoryPage(this.page);
});

When("I navigate to the Categories page", async function (this: CustomWorld) {
  await categoryPage.navigateToCategories();
});

Then("I should see a list of categories", async function (this: CustomWorld) {
  // Fetch categories from backend API
  const categories = await getAllCategories();

  // Verify the UI shows the categories fetched from backend
  const uiCount = await categoryPage.getCategoryCount();
  expect(uiCount).toBe(categories.length);

  // Optionally, verify category names in UI match API data
  for (const category of categories) {
    const isPresent = await categoryPage.isCategoryPresent(category.name);
    expect(isPresent).toBe(true);
  }
});

When("I open the create category dialog", async function (this: CustomWorld) {
  await categoryPage.openCreateCategoryDialog();
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
    logger.info(
      `Filling category form with test data: ${categoryName}, ${icon}, ${categoryType}, ${parentCategory}`
    );
    // Convert "None" to empty string for parentCategory to satisfy string type
    const parentCat = parentCategory === "None" ? "" : parentCategory;
    await categoryPage.fillCategoryForm(
      categoryName,
      icon,
      categoryType,
      parentCat
    );
    // Store created category names in World context for cleanup
    // This global array is used to track categories created during tests
    // so they can be cleaned up after all scenarios run, preventing test data pollution
    if (!this.createdCategoryNames) {
      this.createdCategoryNames = [];
    }
    this.createdCategoryNames.push(categoryName);
  }
);

When("I submit the category form", async function (this: CustomWorld) {
  await categoryPage.submitForm();
});

When("I click the submit button", async function (this: CustomWorld) {
  await categoryPage.clickSubmit();
});

Then(
  "I should see the new category in the list {string}",
  async function (this: CustomWorld, categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(true);
  }
);

// New step definitions added below

When(
  "I open the edit category dialog for {string}",
  async function (this: CustomWorld, categoryName: string) {
    await categoryPage.openEditCategoryDialog(categoryName);
  }
);

When(
  "I open the delete category dialog for {string}",
  async function (this: CustomWorld, categoryName: string) {
    await categoryPage.openDeleteCategoryDialog(categoryName);
  }
);

When("I confirm the delete action", async function (this: CustomWorld) {
  await categoryPage.confirmDelete();
});

When(
  "I search categories with query {string}",
  async function (this: CustomWorld, query: string) {
    await categoryPage.searchCategories(query);
  }
);

When(
  "I filter categories by tab {string}",
  async function (this: CustomWorld, tabName: string) {
    await categoryPage.filterByTab(tabName);
  }
);

Then(
  "I should not see category {string} in the list",
  async function (this: CustomWorld, categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(false);
  }
);

Then(
  "I should see category {string} in the list",
  async function (this: CustomWorld, categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(true);
  }
);

When("I clear the category name field", async function (this: CustomWorld) {
  await categoryPage.clearCategoryNameField();
});

Then(
  "I should see the updated category in the list {string}",
  async function (this: CustomWorld, categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(true);
  }
);

Then(
  "I should see a validation error message {string}",
  async function (this: CustomWorld, message: string) {
    const errorMessage = this.page.locator(".el-form-item__error", {
      hasText: message,
    });
    await errorMessage.waitFor({ state: "visible", timeout: 5000 });
    expect(await errorMessage.isVisible()).toBe(true);
  }
);
