import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load environment variables once at startup
dotenv.config();

const isCI = !!process.env.CI;

// Generate cucumber HTML report after tests

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    actionTimeout: 0,
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Desktop Chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /(?<!mobile)\.feature$/,
    },
    {
      name: "Mobile Chromium",
      use: {
        ...devices["Pixel 5"],
      },
      testMatch: /mobile\/.*\.feature$/,
    },
  ],
  globalSetup: require.resolve("./support/global-setup"),
  globalTeardown: require.resolve("./support/global-teardown"),
});
