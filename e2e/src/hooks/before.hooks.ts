import { Before } from "@cucumber/cucumber";

import { CustomWorld } from "../support/world";
import { logger } from "../support/logger";
import { CategoryPage } from "../pages/category.page";

Before(async function (this: CustomWorld, { pickle }) {
  logger.info(
    `Before scenario: Launching browser for scenario "${pickle.name}"`
  );
  await this.launchBrowser();
  this.categoryPage = new CategoryPage(this.page);
});
