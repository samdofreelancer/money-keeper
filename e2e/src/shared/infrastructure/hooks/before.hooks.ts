import { Before } from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";

import { CustomWorld } from "../../../support/world";
import { logger } from "../../../support/logger";
import { CategoryPage } from "../../../domains/category/infrastructure/pages/category.page";

Before(async function (this: CustomWorld, { pickle }) {
  logger.info(
    `Before scenario: Launching browser for scenario "${pickle.name}"`
  );

  await this.launchBrowser();
  this.categoryPage = new CategoryPage(this.page);

  // Capture browser console logs and output to test logs with scenario name
  if (this.page) {
    this.page.on("console", (msg: any) => {
      const type = msg.type();
      const text = msg.text();
      logger.info(`Browser console [${type}] [${pickle.name}]: ${text}`);
    });
  }

  // Save environment info to JSON file for report metadata
  try {
    const envInfo = await this.getEnvironmentInfo();
    const reportsDir = path.join(__dirname, "..", "..", "metadata");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const envInfoPath = path.join(reportsDir, "environment-info.metadata.json");
    fs.writeFileSync(envInfoPath, JSON.stringify(envInfo, null, 2), "utf-8");
    logger.info(`Environment info saved to ${envInfoPath}`);
  } catch (error) {
    logger.error("Failed to save environment info:", error);
  }
});
