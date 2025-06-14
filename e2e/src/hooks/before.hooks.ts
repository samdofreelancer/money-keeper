import { Before, World } from "@cucumber/cucumber";

import { logger } from "../support/logger";

Before(async function (this: World) {
  logger.info("Before scenario: Launching browser");
  await this.launchBrowser();
});
