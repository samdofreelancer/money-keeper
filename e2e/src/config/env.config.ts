import * as dotenv from "dotenv";
import * as path from "path";

import { EnvironmentConfig } from "../types/config.types";

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config: EnvironmentConfig = {
  // Screenshot configurations
  screenshotOnSuccess: process.env.SCREENSHOT_ON_SUCCESS === "true",

  // Report configurations
  reportsDir: process.env.REPORTS_DIR || path.join(__dirname, "../../reports"),
  screenshotsDir:
    process.env.SCREENSHOTS_DIR ||
    path.join(__dirname, "../../reports/screenshots"),

  // Browser configurations
  browser: {
    name: (process.env.BROWSER_NAME || "chromium") as
      | "chromium"
      | "firefox"
      | "webkit",
    headless: process.env.HEADLESS
      ? process.env.HEADLESS.toLowerCase() === "true"
      : true,
    baseUrl: process.env.BASE_URL || "https://example.com",
  },
};
