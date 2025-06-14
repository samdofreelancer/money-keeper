import fs from "fs";
import path from "path";

import { logger } from "../src/support/logger";

const reportsDir = path.resolve(__dirname, "../reports");
const screenshotsDir = path.join(reportsDir, "screenshots");

function deleteFilesInDir(dir: string) {
  if (!fs.existsSync(dir)) {
    logger.warn(`Directory not found: ${dir}`);
    return;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    }
  }
}

logger.info("Cleaning up reports and screenshots...");
deleteFilesInDir(screenshotsDir);
deleteFilesInDir(reportsDir);
logger.info("Cleanup complete.");
