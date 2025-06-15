import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { config } from "../../config/env.config";
import { logger } from "../../support/logger";

Given("I open the homepage", async function () {
  await this.page.goto(config.browser.baseUrl);
});

When("I navigate to the Categories page", async function () {
  // Assuming there is a navigation link or menu to go to Categories
  await this.page.waitForSelector('li.el-menu-item:has-text("Categories")', {
    state: "visible",
    timeout: 10000,
  });
  await this.page.click('li.el-menu-item:has-text("Categories")');
  await this.page.waitForLoadState("networkidle");
});

Then("I should see a list of categories", async function () {
  const categoryItems = await this.page.locator(
    ".category-tree .tree-node-content"
  );
  expect(await categoryItems.count()).toBeGreaterThan(0);
});

When("I open the create category dialog", async function () {
  await this.page.click('button:has-text("Add Category")');
  await this.page.waitForSelector("form.category-form");
});

When("I fill in the category form with valid data", async function () {
  logger.info("Filling category name");
  await this.page.fill(
    'input[placeholder="Enter category name"]',
    "Test Category"
  );
  logger.info("Clicking select wrapper");
  await this.page.click(".el-select__wrapper");
  logger.info("Waiting for dropdown to be visible");
  await this.page.waitForSelector(".el-select-dropdown", {
    state: "visible",
    timeout: 5000,
  });
  logger.info("Clicking dropdown item 'Grid'");
  await this.page.click('.el-select-dropdown__item:has-text("Grid")');
  logger.info("Waiting for radio label to be visible");
  await this.page.waitForSelector(
    'label.el-radio-button:has(input[value="EXPENSE"])',
    {
      state: "visible",
      timeout: 5000,
    }
  );
  logger.info("Clicking radio label 'EXPENSE'");
  await this.page.click('label.el-radio-button:has(input[value="EXPENSE"])');
  logger.info("Finished filling category form");
});

When("I submit the category form", async function () {
  await this.page.click('button:has-text("Create")');
  // Wait for dialog to close
  await this.page.waitForSelector("form.category-form", { state: "detached" });
});

Then("I should see the new category in the list", async function () {
  const newCategory = this.page.locator(".category-tree .tree-node-content", {
    hasText: "Test Category",
  });
  expect(await newCategory.count()).toBeGreaterThan(0);
});
