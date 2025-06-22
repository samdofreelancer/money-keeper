import { Before, ITestCaseHookParameter } from "@cucumber/cucumber";

import { logger } from "../support/logger";
import { CustomWorld } from "../support/world";

Before(async function (this: CustomWorld, { pickle }: ITestCaseHookParameter) {
  logger.info(
    `Before scenario: Launching browser for scenario "${pickle.name}"`
  );
  await this.launchBrowser();
});
