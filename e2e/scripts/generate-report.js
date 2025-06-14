const reporter = require("multiple-cucumber-html-reporter");
const path = require("path");

function getMetadata() {
  const browserName = process.env.BROWSER_NAME || "chrome";
  const browserVersion = process.env.BROWSER_VERSION || "latest";
  const device = process.env.DEVICE_NAME || "Local test machine";
  const platformName = process.platform || "unknown";
  const platformVersion = process.env.PLATFORM_VERSION || "unknown";

  return {
    browser: {
      name: browserName,
      version: browserVersion,
    },
    device: device,
    platform: {
      name: platformName,
      version: platformVersion,
    },
  };
}

async function generateReport() {
  try {
    reporter.generate({
      jsonDir: path.join(__dirname, "..", "reports"),
      reportPath: path.join(
        __dirname,
        "..",
        "reports",
        "cucumber-html-report.html"
      ),
      openReportInBrowser: process.env.OPEN_REPORT === "true",
      metadata: getMetadata(),
    });
    console.log("Report generated successfully.");
  } catch (error) {
    console.error("Error generating report:", error);
    process.exit(1);
  }
}

generateReport();
