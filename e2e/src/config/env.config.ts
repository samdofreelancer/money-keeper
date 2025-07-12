import * as dotenv from "dotenv";
import * as path from "path";
import { devices } from "@playwright/test";

import { EnvironmentConfig } from "../types/config.types";
import { getTraceMode } from "../utils/validate-trace-mode";

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isCI = !!process.env.CI;

/**
 * Environment configuration for the E2E tests.
 * Includes settings for screenshots, reports, browser, timeouts, retries, and devices.
 */
export const config: EnvironmentConfig = {
  // Screenshot configurations
  screenshotOnSuccess: process.env.SCREENSHOT_ON_SUCCESS === "true",
  screenshotOnFailure: true,

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
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    actionTimeout: Number(process.env.ACTION_TIMEOUT) || 30000,
    trace: getTraceMode(process.env.TRACE_MODE),
  },

  // Test configurations
  timeout: Number(process.env.TEST_TIMEOUT) || 30000,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,

  // Device configurations
  devices: {
    desktop: {
      name: "Desktop Chrome",
      ...devices["Desktop Chrome"],
    },
    mobile: {
      name: "Pixel 5",
      ...devices["Pixel 5"],
    },
  },
};
