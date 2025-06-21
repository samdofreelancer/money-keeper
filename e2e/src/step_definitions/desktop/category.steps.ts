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
