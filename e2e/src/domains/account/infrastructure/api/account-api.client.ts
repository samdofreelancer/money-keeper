// e2e/src/domains/account/infrastructure/api/account-api.client.ts

import axios, { AxiosInstance } from "axios";

import { logger } from "../../../../shared/utils/logger";

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  active: boolean;
}

export interface AccountCreate {
  accountName: string;
  initBalance: number;
  type: string;
  currency: string;
  description?: string;
  active?: boolean;
}

export class AccountApiClient {
  private client: AxiosInstance;

  constructor(config: { baseURL: string }) {
    this.client = axios.create({
      baseURL: `${config.baseURL}/accounts`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        logger.error("API Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(
          `API Error: ${error.response?.status} ${error.config?.url}`,
          error.response?.data
        );
        return Promise.reject(error);
      }
    );
  }

  async getAllAccounts(): Promise<Account[]> {
    const response = await this.client.get("/");
    return response.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.client.delete(`/${id}`);
    logger.info(`Account deleted successfully: ${id}`);
  }

  async deleteAccountByName(accountName: string): Promise<boolean> {
    try {
      logger.info(`Attempting to delete account by name: ${accountName}`);

      // Get all accounts
      const accounts = await this.getAllAccounts();

      // Find account by name
      const accountToDelete = accounts.find(
        (account) => account.name === accountName
      );

      if (!accountToDelete) {
        logger.warn(`Account not found: ${accountName}`);
        return false;
      }

      // Delete by ID
      await this.deleteAccount(accountToDelete.id);
      logger.info(
        `Successfully deleted account: ${accountName} (ID: ${accountToDelete.id})`
      );
      return true;
    } catch (error) {
      logger.error(`Failed to delete account ${accountName}:`, error);
      return false;
    }
  }
}
