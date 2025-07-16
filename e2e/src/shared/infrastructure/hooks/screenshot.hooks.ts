import {
  AfterStep,
  ITestCaseHookParameter,
  Status,
  World,
} from "@cucumber/cucumber";
import * as path from "path";

import { config } from "../../config/env.config";
import { logger } from "../../../support/logger";

AfterStep(async function (
  this: World,
  { pickle, result }: ITestCaseHookParameter
) {
  if (!result) {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (result.status === Status.FAILED) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `failed-step-${pickle.name.replace(/\\W+/g, "_")}-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
    logger.error(
      `Screenshot taken for failed step in scenario "${pickle.name}"`
    );
  } else if (config.screenshotOnSuccess) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `success-step-${pickle.name.replace(/\\W+/g, "_")}-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
    logger.info(
      `Screenshot taken for successful step in scenario "${pickle.name}"`
    );
  }
});
