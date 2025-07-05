import { generate } from "multiple-cucumber-html-reporter";
import * as fs from "fs";
import * as path from "path";

async function getMetadata() {
  const envInfoPath = path.join(
    __dirname,
    "..",
    "..",
    "metadata",
    "environment-info.metadata.json"
  );
  let envInfo = null;

  if (fs.existsSync(envInfoPath)) {
    try {
      envInfo = JSON.parse(fs.readFileSync(envInfoPath, "utf-8"));
    } catch (error) {
      console.warn(
        "Failed to parse environment-info.metadata.json, falling back to defaults."
      );
    }
  }

  if (envInfo) {
    return {
      browser: {
        name: envInfo.browser.name || "unknown",
        version: envInfo.browser.version || "unknown",
      },
      device: envInfo.device || "unknown",
      platform: {
        name: envInfo.platform.name || "unknown",
        version: envInfo.platform.version || "unknown",
      },
    };
  } else {
    return {
      browser: {
        name: "unknown",
        version: "unknown",
      },
      device: "unknown",
      platform: {
        name: process.platform,
        version: process.version,
      },
    };
  }
}

(async () => {
  const metadata = await getMetadata();

  generate({
    jsonDir: "reports",
    reportPath: "reports/cucumber-html-report.html",
    metadata: metadata,
    customData: {
      title: "Run Info",
      data: [
        { label: "Project", value: "Money Keeper E2E Tests" },
        { label: "Environment", value: "Local" },
      ],
    },
    displayDuration: true,
    durationInMS: true,
    displayReportTime: true,
    pageTitle: "Money Keeper Test Report",
    reportName: "Money Keeper E2E Test Results",
  });
})();
