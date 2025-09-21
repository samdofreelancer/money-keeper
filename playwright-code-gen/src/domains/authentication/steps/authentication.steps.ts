import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am on the registration page", async function () {
  // @ts-ignore
  await this.page.goto("/register");
});

When("I enter my username {string}", async function (username) {
  // @ts-ignore
  await this.page.locator('input[name="username"]').fill(username);
});

When("I enter my password {string}", async function (password) {
  // @ts-ignore
  await this.page.locator('input[name="password"]').fill(password);
});

When("I confirm my password {string}", async function (password) {
  // @ts-ignore
  await this.page.locator('input[name="confirmPassword"]').fill(password);
});

When("I click the {string} button", async function (buttonText) {
  // @ts-ignore
  await this.page.locator(`button:has-text("${buttonText}")`).click();
});

Then("I should be redirected to the login page", async function () {
  // @ts-ignore
  await expect(this.page).toHaveURL("/login");
});

Given("I am on the login page", async function () {
  // @ts-ignore
  await this.page.goto("/login");
});

Then("I should be redirected to the dashboard", async function () {
  // @ts-ignore
  await expect(this.page).toHaveURL("/");
});
