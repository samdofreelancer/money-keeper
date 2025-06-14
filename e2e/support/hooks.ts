import { Before, After, AfterStep, Status } from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";

import { logger } from "./logger";

// Create reports directory structure immediately when the module is loaded
const reportsDir = path.join(__dirname, "..", "reports");
const screenshotsDir = path.join(reportsDir, "screenshots");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

Before(async function () {
  logger.info("Before scenario: Launching browser");
  await this.launchBrowser();
});

After(async function () {
  logger.info("After scenario: Closing browser");
  await this.closeBrowser();
});

AfterStep(async function ({ result }) {
  if (result.status === Status.FAILED) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = `reports/screenshots/failed-step-${timestamp}.png`;
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    this.attach(screenshot, "image/png");
  }
  // Removed screenshot on success to improve performance
});
