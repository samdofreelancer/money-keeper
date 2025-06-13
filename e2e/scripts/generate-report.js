const reporter = require("multiple-cucumber-html-reporter");
const path = require("path");

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
