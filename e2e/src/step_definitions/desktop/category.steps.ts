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

When("I fill in the category form with valid data", async function () {
  logger.info("Filling category form with test data");
  await categoryPage.fillCategoryForm("Test Category");
});

When("I submit the category form", async function () {
  await categoryPage.submitCategoryForm();
});

Then("I should see the new category in the list", async function () {
  const isPresent = await categoryPage.isCategoryPresent("Test Category");
  expect(isPresent).toBe(true);
});
