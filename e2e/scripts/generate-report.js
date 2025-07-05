const reporter = require("multiple-cucumber-html-reporter");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

function getMetadata() {
  const envInfoPath = path.join(__dirname, "..", "metadata", "environment-info.metadata.json");
  let envInfo = null;

  if (fs.existsSync(envInfoPath)) {
    try {
      envInfo = JSON.parse(fs.readFileSync(envInfoPath, "utf-8"));
    } catch (error) {
      console.warn("Failed to parse environment-info.json, falling back to env vars.");
    }
  }

  if (envInfo) {
    return {
      browser: {
        name: envInfo.browser.name || "unknown",
        version: envInfo.browser.version || "unknown",
        full: `${envInfo.browser.name || "unknown"} ${envInfo.browser.version || "unknown"}`,
      },
      device: envInfo.device || "unknown",
      platform: {
        name: envInfo.platform.name || "unknown",
        version: envInfo.platform.version || "unknown",
      },
    };
  } else {
    // Fallback to environment variables
    const browserName = process.env.BROWSER_NAME || "chrome";
    const browserVersion = process.env.BROWSER_VERSION || "latest";
    const device = process.env.DEVICE_NAME || "Local test machine";
    const platformName = process.platform || "unknown";
    const platformVersion = process.env.PLATFORM_VERSION || "unknown";

    return {
      browser: {
        name: browserName,
        version: browserVersion,
        full: `${browserName} ${browserVersion}`,
      },
      device: device,
      platform: {
        name: platformName,
        version: platformVersion,
      },
    };
  }
}

async function generateReport() {
  try {
    const metadata = getMetadata();

    // Get git branch and commit ID
    let gitBranch = "unknown";
    let gitCommitId = "unknown";
    try {
      gitBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
      gitCommitId = execSync("git rev-parse HEAD").toString().trim();
    } catch (error) {
      console.warn("Failed to get git info:", error);
    }

    // Add git info to metadata
    metadata.git = {
      branch: gitBranch,
      commitId: gitCommitId,
    };

    // Remove override of metadata.browser.version to avoid duplication
    // metadata.browser.version = `${metadata.browser.name} ${metadata.browser.version}`;

    reporter.generate({
      jsonDir: path.join(__dirname, "..", "reports"),
      reportPath: path.join(
        __dirname,
        "..",
        "reports",
        "cucumber-html-report.html"
      ),
      openReportInBrowser: process.env.OPEN_REPORT === "true",
      metadata: metadata,
      customData: {
        title: "Additional Info",
        data: [
          { label: "Git Branch", value: metadata.git.branch },
          { label: "Git Commit ID", value: metadata.git.commitId },
          { label: "Browser", value: `${metadata.browser.name} ${metadata.browser.version}` },
        ],
      },
    });
    console.log("Report generated successfully.");
  } catch (error) {
    console.error("Error generating report:", error);
    process.exit(1);
  }
}

generateReport();
