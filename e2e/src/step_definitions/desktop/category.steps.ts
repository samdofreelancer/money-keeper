import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { getAllCategories } from "../../api/categoryApiHelper";
import { CategoryPage } from "../../pages/category.page";
import { config } from "../../config/env.config";
import { logger } from "../../support/logger";

let categoryPage: CategoryPage;

Given("I open the homepage", async function () {
  await this.page.goto(config.browser.baseUrl);
  categoryPage = new CategoryPage(this.page);
});

When("I navigate to the Categories page", async function () {
  await categoryPage.navigateToCategories();
});

Then("I should see a list of categories", async function () {
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

When("I open the create category dialog", async function () {
  await categoryPage.openCreateCategoryDialog();
});

When(
  "I fill in the category form with valid data {string}, {string}, {string}, {string}",
  async function (
    this: any,
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

When("I submit the category form", async function () {
  await categoryPage.submitCategoryForm();
});

Then(
  "I should see the new category in the list {string}",
  async function (categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(true);
  }
);

// New step definitions added below

When(
  "I open the edit category dialog for {string}",
  async function (categoryName: string) {
    await categoryPage.openEditCategoryDialog(categoryName);
  }
);

When(
  "I open the delete category dialog for {string}",
  async function (categoryName: string) {
    await categoryPage.openDeleteCategoryDialog(categoryName);
  }
);

When("I confirm the delete action", async function () {
  await categoryPage.confirmDelete();
});

When("I search categories with query {string}", async function (query: string) {
  await categoryPage.searchCategories(query);
});

When("I filter categories by tab {string}", async function (tabName: string) {
  await categoryPage.filterByTab(tabName);
});

Then(
  "I should not see category {string} in the list",
  async function (categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(false);
  }
);

Then(
  "I should see category {string} in the list",
  async function (categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(true);
  }
);

When("I clear the category name field", async function () {
  await categoryPage.clearCategoryNameField();
});

Then(
  "I should see the updated category in the list {string}",
  async function (categoryName: string) {
    const isPresent = await categoryPage.isCategoryPresent(categoryName);
    expect(isPresent).toBe(true);
  }
);

Then(
  "I should see a validation error message {string}",
  async function (message: string) {
    const errorMessage = this.page.locator(".el-form-item__error", {
      hasText: message,
    });
    await errorMessage.waitFor({ state: "visible", timeout: 5000 });
    expect(await errorMessage.isVisible()).toBe(true);
  }
);
