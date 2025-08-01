const fs = require("fs");
const path = require("path");

function cleanReports() {
  const reportsDir = path.join(__dirname, "..", "reports");

  if (!fs.existsSync(reportsDir)) {
    console.log("Reports directory does not exist, creating...");
    fs.mkdirSync(reportsDir, { recursive: true });
    return;
  }

  console.log("Cleaning reports directory...");

  try {
    const files = fs.readdirSync(reportsDir);

    for (const file of files) {
      const filePath = path.join(reportsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && file.endsWith(".json")) {
        console.log(`Removing JSON report: ${file}`);
        fs.unlinkSync(filePath);
      } else if (stat.isDirectory() && file.includes("html-report")) {
        console.log(`Removing HTML report directory: ${file}`);
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    }

    console.log("Reports directory cleaned successfully");
  } catch (error) {
    console.error("Error cleaning reports directory:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanReports();
}

module.exports = cleanReports;
