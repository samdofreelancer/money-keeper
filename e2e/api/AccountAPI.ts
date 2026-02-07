import { ApiClient } from '@/helpers/api.client';
import { logger } from '@/utils/logger';

/**
 * Account API Client for E2E Tests
 *
 * Provides domain-level API operations:
 * - Create/Read/Update/Delete accounts via REST API
 * - Cleanup test data (delete all TEST_ accounts)
 * - Fixture setup (create test data faster than UI)
 *
 * ✅ Separates HTTP concerns (ApiClient) from business logic
 * ✅ Used for data setup/teardown, NOT for UI test assertions
 * ✅ Structured logging via logger utility
 */

export interface Account {
  id: string | number;
  accountName: string;
  initBalance: number;
  type: string;
  currency: string;
  description?: string;
  active?: boolean;
}

export interface AccountCreate {
  accountName: string;
  initBalance: number;
  type: string;
  currency: string;
  description?: string;
}

export class AccountAPI {
  private client: ApiClient;

  constructor(baseURL?: string) {
    this.client = new ApiClient(baseURL);
  }

  /**
   * Fetch all accounts
   */
  async getAll(): Promise<Account[]> {
    const response = await this.client.get<Account[]>('/accounts');
    if (response.status !== 200 || !response.data) {
      logger.warn('Failed to fetch accounts');
      return [];
    }
    return response.data;
  }

  /**
   * Get single account by ID
   */
  async getById(id: string | number): Promise<Account | null> {
    const response = await this.client.get<Account>(`/accounts/${id}`);
    if (response.status !== 200 || !response.data) {
      logger.warn(`Account ${id} not found`);
      return null;
    }
    return response.data;
  }

  /**
   * Create a new account
   */
  async create(account: AccountCreate): Promise<Account | null> {
    const response = await this.client.post<Account>('/accounts', account);
    if (response.status !== 200 && response.status !== 201) {
      logger.error(`Failed to create account: ${response.status}`);
      return null;
    }
    logger.success(`Account created: ${account.accountName}`);
    return response.data;
  }

  /**
   * Update an account
   */
  async update(id: string | number, account: Partial<AccountCreate>): Promise<Account | null> {
    const response = await this.client.put<Account>(`/accounts/${id}`, account);
    if (response.status !== 200) {
      logger.error(`Failed to update account ${id}: ${response.status}`);
      return null;
    }
    logger.success(`Account updated: ${id}`);
    return response.data;
  }

  /**
   * Delete an account by ID
   */
  async delete(id: string | number): Promise<boolean> {
    const response = await this.client.delete(`/accounts/${id}`);
    if (response.status !== 200 && response.status !== 204) {
      logger.error(`Failed to delete account ${id}: ${response.status}`);
      return false;
    }
    logger.success(`Account deleted: ${id}`);
    return true;
  }

  /**
   * Find account by name
   */
  async findByName(name: string): Promise<Account | null> {
    const accounts = await this.getAll();
    return accounts.find((acc) => acc.accountName === name) || null;
  }

  /**
   * Delete all accounts matching a pattern (useful for cleanup)
   */
  async deleteByNamePattern(namePattern: string): Promise<number> {
    logger.debug(`Searching for accounts matching pattern: "${namePattern}"`);
    const accounts = await this.getAll();
    logger.debug(`Found ${accounts.length} total accounts`);
    
    const toDelete = accounts.filter((acc) =>
      acc.accountName.includes(namePattern)
    );
    
    logger.debug(`Found ${toDelete.length} accounts matching "${namePattern}": ${toDelete.map(a => a.accountName).join(', ')}`);

    let deleted = 0;
    for (const account of toDelete) {
      logger.debug(`Deleting account: ${account.accountName} (ID: ${account.id})`);
      const success = await this.delete(String(account.id));
      if (success) deleted++;
    }

    return deleted;
  }

  /**
   * Cleanup: Delete all test accounts created during testing
   */
  async cleanupTestAccounts(testPrefix: string = 'TEST_'): Promise<number> {
    logger.info(`Starting cleanup of accounts with prefix: "${testPrefix}"`);
    const deleted = await this.deleteByNamePattern(testPrefix);
    logger.info(`Cleanup complete: deleted ${deleted} accounts`);
    return deleted;
  }
}

// Export singleton instance for convenience
export const accountAPI = new AccountAPI();
