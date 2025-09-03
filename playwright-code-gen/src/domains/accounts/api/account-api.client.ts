import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { Logger } from 'shared/utilities/logger';
import {
  AccountApiDto,
  AccountCreateDto,
} from 'account-domains/types/account.dto';
import { Inject, Transient } from 'shared/di/decorators';
import { TOKENS } from 'shared/di/tokens';

@Transient({ token: TOKENS.AccountApiClient })
export class AccountApiClient {
  private client: AxiosInstance;

  constructor(@Inject(TOKENS.ApiBaseUrl) baseUrl: string) {
    if (!baseUrl) throw new Error('API_BASE_URL is required for tests');

    this.client = axios.create({
      baseURL: `${baseUrl}/accounts`,
      headers: {
        'Content-Type': 'application/json',
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
        Logger.error('API Request Error:', error);
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

  async getAllAccounts(): Promise<AccountApiDto[]> {
    const response = await this.client.get<AccountApiDto[]>('/');
    return response.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.client.delete(`/${id}`);
    Logger.info(`Account deleted successfully: ${id}`);
  }

  async create(account: AccountCreateDto): Promise<AccountApiDto> {
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
      const response = await this.client.post<AccountApiDto>('/', payload);
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
        account => account.accountName === accountName
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
