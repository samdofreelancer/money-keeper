import axios from "axios";
import { logger } from "../support/logger";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8080/api";

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    logger.info("API health check successful");
    return response.status === 200;
  } catch (error) {
    logger.warn(`API health check failed: ${error}`);
    return false;
  }
}

export async function waitForApiReady(maxRetries = 10, delay = 2000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const isHealthy = await checkApiHealth();
    if (isHealthy) {
      logger.info("API is ready");
      return true;
    }
    logger.info(`API not ready, waiting ${delay}ms... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  logger.error("API failed to become ready after maximum retries");
  return false;
}
