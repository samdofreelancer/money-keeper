import axios, { AxiosInstance } from 'axios';
import { logger } from '@/utils/logger';

/**
 * Account API Client for E2E Tests
 * 
 * Provides direct API access for:
 * - Data cleanup (delete test accounts)
 * - Data verification (fetch account list)
 * - Fixture setup (create test data via API instead of UI)
 * 
 * ✅ Uses direct axios calls (faster than UI automation)
 * ✅ Separates concerns: UI tests use PageObject, API tests use this
 * ✅ Enables data cleanup after tests (automatic)
 * ✅ Structured logging via logger utility
 */

export interface Account {
  id: string | number;
  name?: string;
  accountName?: string;
  type: string;
  balance?: number;
  initBalance?: number;
  currency: string;
  active?: boolean;
  description?: string;
}

export interface AccountCreate {
  accountName: string;
  initBalance: number;
  type: string;
  currency: string;
  description?: string;
  active?: boolean;
}

export class AccountAPI {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8080/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status code
    });
  }

  /**
   * Fetch all accounts
   * @returns Array of accounts
   */
  async getAll(): Promise<Account[]> {
    try {
      const response = await this.client.get<Account[]>('/accounts');
      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch accounts');
      logger.debug('Error details', error);
      return [];
    }
  }

  /**
   * Create a new account
   * @param account Account details to create
   * @returns Created account with ID
   */
  async create(account: AccountCreate): Promise<Account | null> {
    try {
      const response = await this.client.post<Account>('/accounts', account);
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
      logger.error(`Failed to create account with status: ${response.status}`);
      logger.debug('Response data', response.data);
      return null;
    } catch (error) {
      logger.error('Failed to create account');
      logger.debug('Error details', error);
      return null;
    }
  }

  /**
   * Delete an account by ID
   * @param id Account ID to delete
   * @returns true if successful, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/accounts/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      logger.error(`Failed to delete account ${id}`);
      logger.debug('Error details', error);
      return false;
    }
  }

  /**
   * Find account by name
   * @param name Account name to search for
   * @returns Account if found, null otherwise
   */
  async findByName(name: string): Promise<Account | null> {
    try {
      const accounts = await this.getAll();
      return (
        accounts.find((acc) => acc.name === name || acc.accountName === name) ||
        null
      );
    } catch (error) {
      logger.error('Failed to find account by name');
      logger.debug('Error details', error);
      return null;
    }
  }

  /**
   * Delete all accounts matching a pattern (useful for cleanup)
   * @param namePattern Partial name to match
   * @returns Number of accounts deleted
   */
  async deleteByNamePattern(namePattern: string): Promise<number> {
    try {
      const accounts = await this.getAll();
      const toDelete = accounts.filter((acc) => {
        // Check both 'name' and 'accountName' properties
        const accountName = acc?.name || acc?.accountName;
        if (!accountName || typeof accountName !== 'string') {
          return false;
        }
        return accountName.includes(namePattern);
      });
      
      let deleted = 0;
      for (const account of toDelete) {
        const success = await this.delete(String(account.id));
        if (success) deleted++;
      }
      
      return deleted;
    } catch (error) {
      logger.error('Failed to delete accounts by pattern');
      logger.debug('Error details', error);
      return 0;
    }
  }

  /**
   * Cleanup: Delete all test accounts created during testing
   * Run this after test completion
   * @param testPrefix Prefix used for test account names (e.g., "TEST_")
   * @returns Number of accounts deleted
   */
  async cleanupTestAccounts(testPrefix: string = 'TEST_'): Promise<number> {
    return this.deleteByNamePattern(testPrefix);
  }
}

// Export singleton instance for convenience
export const accountAPI = new AccountAPI();
