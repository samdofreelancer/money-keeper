import {
  AfterStep,
  ITestCaseHookParameter,
  Status,
  World,
} from "@cucumber/cucumber";
import * as path from "path";

import { config } from "../config/env.config";

AfterStep(async function (this: World, { result }: ITestCaseHookParameter) {
  if (!result) {
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (result.status === Status.FAILED) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `failed-step-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
  } else if (config.screenshotOnSuccess) {
    const screenshotPath = path.join(
      config.screenshotsDir,
      `success-step-${timestamp}.png`
    );
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
  }
});
