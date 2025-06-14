import { After, World } from "@cucumber/cucumber";

import { logger } from "../support/logger";

After(async function (this: World) {
  logger.info("After scenario: Closing browser");
  await this.closeBrowser();
});
