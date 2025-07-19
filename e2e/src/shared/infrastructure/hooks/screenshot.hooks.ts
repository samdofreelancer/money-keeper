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
  logger.info(
    `[DEBUG] AfterStep hook running for scenario: ${pickle.name}, config.screenshotAllAfterStep: ${config.screenshotAllAfterStep}`
  );
  if (!result) {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  config.screenshotAllAfterStep = true;
  if (config.screenshotAllAfterStep) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `${
        result.status === Status.FAILED ? "failed" : "step"
      }-${pickle.name.replace(/\W+/g, "_")}-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
    logger.info(
      `Screenshot taken for ${
        result.status === Status.FAILED ? "failed " : ""
      }step in scenario "${pickle.name}"`
    );
  } else if (result.status === Status.FAILED) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `failed-step-${pickle.name.replace(/\W+/g, "_")}-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
    logger.error(
      `Screenshot taken for failed step in scenario "${pickle.name}"`
    );
  }
});
