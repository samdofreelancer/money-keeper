import * as fs from "fs";

import { config } from "../config/env.config";
import { isValidTraceMode as validateTraceMode } from "./validate-trace-mode";
import { logger } from "./logger";

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

  // Validate trace mode
  if (process.env.TRACE_MODE && !validateTraceMode(process.env.TRACE_MODE)) {
    throw new Error(
      `Invalid TRACE_MODE value: ${process.env.TRACE_MODE}. Must be one of: on, off, on-first-retry, on-all-retries, retain-on-failure`
    );
  }

  // Validate screenshot directory
  if (config.screenshotsDir && typeof config.screenshotsDir !== "string") {
    throw new Error("SCREENSHOTS_DIR must be a string");
  }

  // Validate browser name
  if (!["chromium", "firefox", "webkit"].includes(config.browser.name)) {
    throw new Error(
      `Invalid browser name: ${config.browser.name}. Must be one of: chromium, firefox, webkit`
    );
  }

  logger.info("Environment configuration validated successfully");
}

validateConfig();
