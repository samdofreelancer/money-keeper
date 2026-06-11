import { Account, Category, Transaction } from '../models';

/**
 * Repository Port - Abstract interface for Account persistence
 * Implement this interface to handle Account storage (database, API, etc.)
 */
export interface IAccountRepository {
  /**
   * Find account by ID
   */
  findById(id: string): Promise<Account | null>;

  /**
   * Find all accounts
   */
  findAll(): Promise<Account[]>;

  /**
   * Find active accounts only
   */
  findAllActive(): Promise<Account[]>;

  /**
   * Check if account name is unique
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Save account (create or update)
   */
  save(account: Account): Promise<Account>;

  /**
   * Delete account by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Delete multiple accounts
   */
  deleteMultiple(ids: string[]): Promise<void>;
}

/**
 * Repository Port - Abstract interface for Category persistence
 * Implement this interface to handle Category storage
 */
export interface ICategoryRepository {
  /**
   * Find category by ID
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find all categories
   */
  findAll(): Promise<Category[]>;

  /**
   * Find active categories only
   */
  findAllActive(): Promise<Category[]>;

  /**
   * Find categories by type
   */
  findByType(type: string): Promise<Category[]>;

  /**
   * Find child categories of a parent
   */
  findByParentId(parentId: string): Promise<Category[]>;

  /**
   * Check if category name is unique within type
   */
  existsByName(name: string, type: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if category has child categories
   */
  hasChildren(id: string): Promise<boolean>;

  /**
   * Save category (create or update)
   */
  save(category: Category): Promise<Category>;

  /**
   * Delete category by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Delete multiple categories
   */
  deleteMultiple(ids: string[]): Promise<void>;
}

/**
 * Repository Port - Abstract interface for Transaction persistence
 * Implement this interface to handle Transaction storage
 */
export interface ITransactionRepository {
  /**
   * Find transaction by ID
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Find all transactions
   */
  findAll(): Promise<Transaction[]>;

  /**
   * Find transactions by account
   */
  findByAccountId(accountId: string): Promise<Transaction[]>;

  /**
   * Find transactions by category
   */
  findByCategoryId(categoryId: string): Promise<Transaction[]>;

  /**
   * Find transactions by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;

  /**
   * Find transactions by type
   */
  findByType(type: string): Promise<Transaction[]>;

  /**
   * Find transactions for an account within date range
   */
  findByAccountAndDateRange(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;

  /**
   * Check if category has transactions
   */
  hasByCategoryId(categoryId: string): Promise<boolean>;

  /**
   * Check if reversal exists for transaction
   */
  hasReversal(transactionId: string): Promise<boolean>;

  /**
   * Save transaction (create or update)
   */
  save(transaction: Transaction): Promise<Transaction>;

  /**
   * Save multiple transactions (batch operation)
   */
  saveMultiple(transactions: Transaction[]): Promise<Transaction[]>;

  /**
   * Delete transaction by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Delete multiple transactions
   */
  deleteMultiple(ids: string[]): Promise<void>;
}
