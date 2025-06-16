import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

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
  const count = await categoryPage.getCategoryCount();
  expect(count).toBeGreaterThan(0);
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
    // Handle placeholder for createdCategoryName
    if (categoryName === "<createdCategoryName>") {
      categoryName = this.uniqueCategoryName;
    }
    // Append unique suffix to categoryName to ensure uniqueness
    const uniqueSuffix = Date.now().toString();
    const uniqueCategoryName = `${categoryName} ${uniqueSuffix}`;
    this.uniqueCategoryName = uniqueCategoryName; // store for later steps
    logger.info(
      `Filling category form with test data: ${uniqueCategoryName}, ${icon}, ${categoryType}, ${parentCategory}`
    );
    await categoryPage.fillCategoryForm(
      uniqueCategoryName,
      icon,
      categoryType,
      parentCategory
    );
  }
);

When("I submit the category form", async function () {
  await categoryPage.submitCategoryForm();
});

Then(
  "I should see the new category in the list {string}",
  async function (categoryName: string) {
    // Use stored unique category name if available
    const nameToCheck = this.uniqueCategoryName || categoryName;
    const isPresent = await categoryPage.isCategoryPresent(nameToCheck);
    expect(isPresent).toBe(true);
  }
);

When(
  "I open the edit category dialog for {string}",
  async function (categoryName: string) {
    // Handle placeholder for createdCategoryName
    if (categoryName === "<createdCategoryName>") {
      categoryName = this.uniqueCategoryName;
    }
    try {
      await categoryPage.openEditCategoryDialog(categoryName);
    } catch (error) {
      console.error(`Failed to open edit dialog for category "${categoryName}":`, error);
      await this.page.screenshot({ path: `error-open-edit-dialog-${Date.now()}.png` });
      throw error;
    }
  }
);

Then(
  "I should see the updated category in the list {string}",
  async function (categoryName: string) {
    // Use stored unique category name if available
    const nameToCheck = this.uniqueCategoryName || categoryName;
    const isPresent = await categoryPage.isCategoryPresent(nameToCheck);
    expect(isPresent).toBe(true);
  }
);
