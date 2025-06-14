import { generate } from "multiple-cucumber-html-reporter";

import { config } from "../config/env.config";

generate({
  jsonDir: "reports",
  reportPath: "reports/cucumber-html-report.html",
  metadata: {
    browser: {
      name: config.browser.name,
      version: "latest",
    },
    platform: {
      name: process.platform,
      version: process.version,
    },
  },
  customData: {
    title: "Run Info",
    data: [
      { label: "Project", value: "Money Keeper E2E Tests" },
      { label: "Environment", value: config.browser.baseUrl },
    ],
  },
  displayDuration: true,
  durationInMS: true,
  displayReportTime: true,
  pageTitle: "Money Keeper Test Report",
  reportName: "Money Keeper E2E Test Results",
});
