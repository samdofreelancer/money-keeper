import { Given, Then, World } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { config } from "../../config/env.config";
import { logger } from "../../support/logger";

Given("I open the homepage", async function (this: World) {
  await this.page.goto(config.browser.baseUrl);
  const title = await this.currentPage.getTitle();
  logger.info(`Opened homepage with title: ${title}`);
});

Then(
  "I should see the title {string}",
  async function (this: World, title: string) {
    const currentTitle = await this.currentPage.getTitle();
    expect(currentTitle).toBe(title);
  }
);
