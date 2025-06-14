import * as fs from "fs";

import { config } from "../config/env.config";
import { logger } from "../support/logger";

function validateConfig() {
  // Validate required directories exist or can be created
  const directories = [config.reportsDir, config.screenshotsDir];

  directories.forEach((dir) => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    } catch (error) {
      logger.error(`Error creating directory ${dir}:`, error);
      process.exit(1);
    }
  });

  // Validate boolean values
  if (typeof config.screenshotOnSuccess !== "boolean") {
    logger.error('SCREENSHOT_ON_SUCCESS must be either "true" or "false"');
    process.exit(1);
  }

  // Validate base URL
  try {
    new URL(config.browser.baseUrl);
  } catch {
    logger.error("BASE_URL must be a valid URL");
    process.exit(1);
  }

  logger.info("Environment configuration validated successfully");
}

validateConfig();
