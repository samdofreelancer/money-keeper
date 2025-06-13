import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I open the homepage", async function () {
  await this.page.goto("https://example.com");
});

Then("I should see the title {string}", async function (title: string) {
  await expect(this.page).toHaveTitle(title);
});
