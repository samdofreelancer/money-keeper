import * as dotenv from "dotenv";

import { logger } from "./logger";

export default async function globalSetup() {
  dotenv.config();
  logger.info("Global setup: Environment variables loaded");
}
