import { generate } from "multiple-cucumber-html-reporter";

export default async function globalTeardown() {
  generate({
    jsonDir: "reports",
    reportPath: "reports/cucumber-html-report.html",
    metadata: {
      browser: {
        name: "chromium",
        version: "latest",
      },
      device: "Local test machine",
      platform: {
        name: process.platform,
        version: process.version,
      },
    },
    customData: {
      title: "Run info",
      data: [
        { label: "Project", value: "BDD Playwright Cucumber" },
        { label: "Parallel", value: "Feature files" },
        { label: "Executed", value: new Date().toLocaleString() },
      ],
    },
  });
  console.log("Global teardown: Cucumber HTML report generated");
}
