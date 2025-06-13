import * as dotenv from "dotenv";

export default async function globalSetup() {
  dotenv.config();
  console.log("Global setup: Environment variables loaded");
}
