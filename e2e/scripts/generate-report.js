import reporter from "multiple-cucumber-html-reporter";
import path from "path";

reporter.generate({
  jsonDir: path.join(__dirname, "..", "reports"),
  reportPath: path.join(
    __dirname,
    "..",
    "reports",
    "cucumber-html-report.html"
  ),
  openReportInBrowser: false,
  metadata: {
    browser: {
      name: "chrome",
      version: "latest",
    },
    device: "Local test machine",
    platform: {
      name: "windows",
      version: "10",
    },
  },
});
