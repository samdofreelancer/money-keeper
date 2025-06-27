import { Before } from "@cucumber/cucumber";

import { CustomWorld } from "../support/world";
import { logger } from "../support/logger";
import { CategoryPage } from "../pages/category.page";

Before(async function (this: CustomWorld, { pickle }) {
  logger.info(
    `Before scenario: Launching browser for scenario "${pickle.name}"`
  );

  // Capture browser console logs and output to test logs
  this.page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`Browser console [${type}]: ${text}`);
  });

  await this.launchBrowser();
  this.categoryPage = new CategoryPage(this.page);
});
