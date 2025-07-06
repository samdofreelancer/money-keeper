import { Given } from "@cucumber/cucumber";
import { config } from "../../config/env.config";
import { CustomWorld } from "../../support/world";
import { logger } from "../../support/logger";

Given("I open the homepage", async function (this: CustomWorld) {
  logger.info("Opening homepage with base URL:", config.browser.baseUrl);
  await this.page.goto(config.browser.baseUrl);
});
