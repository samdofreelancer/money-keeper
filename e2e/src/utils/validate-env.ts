import * as fs from "fs";

import { config } from "../config/env.config";

function validateConfig() {
  // Validate required directories exist or can be created
  const directories = [config.reportsDir, config.screenshotsDir];

  directories.forEach((dir) => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
      process.exit(1);
    }
  });

  // Validate boolean values
  if (typeof config.screenshotOnSuccess !== "boolean") {
    console.error('SCREENSHOT_ON_SUCCESS must be either "true" or "false"');
    process.exit(1);
  }

  console.log("Environment configuration validated successfully");
}

validateConfig();
