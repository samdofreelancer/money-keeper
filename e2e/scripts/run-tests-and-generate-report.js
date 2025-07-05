const { exec } = require("child_process");
const path = require("path");
const reporter = require("./generate-report");

function runTests() {
  return new Promise((resolve, reject) => {
    const testProcess = exec("npm run test:parallel", { cwd: path.join(__dirname, "..") });

    testProcess.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    testProcess.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    testProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test process exited with code ${code}`));
      }
    });
  });
}

async function main() {
  const startTime = Date.now();
  let totalExecutionTimeMs = 0;
  try {
    await runTests();
  } catch (error) {
    console.error("Test run failed:", error);
  } finally {
    const endTime = Date.now();
    totalExecutionTimeMs = endTime - startTime;
    console.log(`totalExecutionTimeMs: `, totalExecutionTimeMs);

    // Pass totalExecutionTimeMs to generate-report.js
    // We will modify generate-report.js to accept this as an environment variable
    process.env.TOTAL_EXECUTION_TIME_MS = totalExecutionTimeMs.toString();

    // Import and run generate-report.js main function
    const generateReport = require("./generate-report");
    if (typeof generateReport === "function") {
      await generateReport();
    } else if (generateReport.generateReport) {
      await generateReport.generateReport();
    } else {
      console.error("generate-report.js does not export a callable function");
      process.exit(1);
    }
  }
}

main();
