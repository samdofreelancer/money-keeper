import { After, World, ITestCaseHookParameter } from "@cucumber/cucumber";

import { logger } from "../support/logger";

After(async function (this: World, { pickle, result }: ITestCaseHookParameter) {
  logger.info(
    `After scenario: Closing browser for scenario "${pickle.name}" with status ${result?.status}`
  );
  await this.closeBrowser();
});
