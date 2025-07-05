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

function formatDuration(durationNs) {
  // Convert nanoseconds to seconds with 2 decimal places
  const seconds = durationNs / 1e9;
  if (seconds < 60) {
    return `${seconds.toFixed(2)} seconds`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes} minutes ${remainingSeconds} seconds`;
  }
}

function generateReport() {
  return new Promise((resolve, reject) => {
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

      // Use total execution time from environment variable if provided
      let totalExecutionTime = "unknown";
      if (process.env.TOTAL_EXECUTION_TIME_MS) {
        const durationMs = parseInt(process.env.TOTAL_EXECUTION_TIME_MS, 10);
      if (!isNaN(durationMs)) {
        totalExecutionTime = formatDuration(durationMs * 1e6);
      }
      } else {
        // Calculate total execution time by summing durations in JSON report files
        const reportsDir = path.join(__dirname, "..", "reports");
        let totalDurationNs = 0;
        const files = fs.readdirSync(reportsDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const content = fs.readFileSync(path.join(reportsDir, file), "utf-8");
              const json = JSON.parse(content);
              if (Array.isArray(json)) {
                for (const feature of json) {
                  if (feature.elements) {
                    for (const element of feature.elements) {
                      if (element.steps) {
                        for (const step of element.steps) {
                          if (step.result && step.result.duration) {
                            totalDurationNs += step.result.duration;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.warn(`Failed to parse report file ${file}:`, error);
            }
          }
        }
        totalExecutionTime = formatDuration(totalDurationNs);
      }

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
            { label: "Total Execution Time", value: totalExecutionTime },
          ],
        },
      });
      console.log("Report generated successfully.");
      resolve();
    } catch (error) {
      console.error("Error generating report:", error);
      reject(error);
    }
  });
}
module.exports = generateReport;

generateReport();
