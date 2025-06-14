import { Before, World, ITestCaseHookParameter } from "@cucumber/cucumber";

import { logger } from "../support/logger";

Before(async function (this: World, { pickle }: ITestCaseHookParameter) {
  logger.info(
    `Before scenario: Launching browser for scenario "${pickle.name}"`
  );
  await this.launchBrowser();
});
