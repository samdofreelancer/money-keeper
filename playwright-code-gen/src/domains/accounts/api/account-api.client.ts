import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { Logger } from "../../../shared/utilities/logger";

export interface Account {
  id: string;
  accountName: string;
  type: string;
  balance: number;
  active: boolean;
}

export class AccountCreate {
  public readonly accountName: string;
  public readonly initBalance: number;
  public readonly type: string;
  public readonly currency: string;
  public readonly description?: string;
  public readonly active?: boolean;

  constructor(data: {
    accountName: string;
    initBalance: number;
    type: string;
    currency: string;
    description?: string;
    active?: boolean;
  }) {
    if (!data.accountName || typeof data.accountName !== "string") {
      throw new Error("Invalid or missing accountName");
    }
    if (
      data.initBalance === undefined ||
      data.initBalance === null ||
      isNaN(Number(data.initBalance))
    ) {
      throw new Error("Invalid or missing initBalance");
    }
    if (!data.type || typeof data.type !== "string") {
      throw new Error("Invalid or missing type");
    }
    if (!data.currency || typeof data.currency !== "string") {
      throw new Error("Invalid or missing currency");
    }

    this.accountName = data.accountName;
    this.initBalance = Number(data.initBalance);
    this.type = data.type;
    this.currency = data.currency;
    this.description = data.description;
    this.active = data.active;
  }
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
      (config: InternalAxiosRequestConfig) => {
        Logger.info(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error: AxiosError) => {
        Logger.error("API Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        Logger.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        Logger.error(
          `API Error: ${error.response?.status} ${error.config?.url}`,
          error.response?.data
        );
        return Promise.reject(error);
      }
    );
  }

  async getAllAccounts(): Promise<Account[]> {
    const response = await this.client.get<Account[]>("/");
    return response.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.client.delete(`/${id}`);
    Logger.info(`Account deleted successfully: ${id}`);
  }

  async create(account: AccountCreate): Promise<Account> {
    try {
      Logger.info(`Creating account: ${account.accountName}`);
      // Convert class instance to plain object for API request
      const payload = {
        accountName: account.accountName,
        initBalance: account.initBalance,
        type: account.type,
        currency: account.currency,
        description: account.description,
        active: account.active,
      };
      const response = await this.client.post<Account>("/", payload);
      Logger.info(`Account created successfully: ${account.accountName}`);
      return response.data;
    } catch (error) {
      Logger.error(`Failed to create account ${account.accountName}:`, error);
      throw error;
    }
  }

  async deleteAccountByName(accountName: string): Promise<boolean> {
    try {
      Logger.info(`Attempting to delete account by name: ${accountName}`);

      // Get all accounts
      const accounts = await this.getAllAccounts();

      // Find account by name
      const accountToDelete = accounts.find(
        (account) => account.accountName === accountName
      );

      if (!accountToDelete) {
        Logger.warn(`Account not found: ${accountName}`);
        return false;
      }

      // Delete by ID
      await this.deleteAccount(accountToDelete.id);
      Logger.info(
        `Successfully deleted account: ${accountName} (ID: ${accountToDelete.id})`
      );
      return true;
    } catch (error) {
      Logger.error(`Failed to delete account ${accountName}:`, error);
      return false;
    }
  }
}
