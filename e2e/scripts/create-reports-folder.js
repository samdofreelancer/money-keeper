import fs from "fs";
import path from "path";

const reportsDir = path.join(__dirname, "..", "reports");
const screenshotsDir = path.join(reportsDir, "screenshots");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
  console.log("Created reports directory");
}

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
  console.log("Created screenshots directory");
}
