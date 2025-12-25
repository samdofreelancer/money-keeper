// src/shared/utilities/test-data.ts
import { Logger } from './logger';
import { getAccountDeletionApiUseCase, getCategoryApiClient } from './hooks';
import { AccountDeletionApiUseCase } from '@/domains/accounts/usecases/api/AccountDeletionApiUseCase';
import { CategoryResponse } from '@/domains/category/types/category.dto';
import { CategoryApiClient } from '@/domains/category';

/**
 * TestData
 * - Trung tâm quản lý test data được tạo trong scenario.
 * - KHÔNG phụ thuộc Playwright/UI.
 * - Cleanup:
 *    - Account: API (AccountDeletionApiUseCase)
 *    - Category: API (CategoryDeletionApiUseCase)
 */
export class TestData {
  /** Accounts được tạo trong scenario */
  private static createdAccounts: Set<string> = new Set();
  /** Categories được tạo trong scenario */
  private static createdCategories: Set<string> = new Set();

  // =======================
  // Naming helpers
  // =======================

  /**
   * Tạo testId từ tên scenario (lowercase, thay khoảng trắng = '-', bỏ ký tự đặc biệt, giới hạn 100).
   */
  static generateTestId(scenarioName: string): string {
    return scenarioName
      .toLowerCase()
      .replace(/\s+/g, '-') // spaces -> hyphens
      .replace(/[^a-z0-9-]/g, '') // remove non-alnum & '-'
      .substring(0, 100);
  }

  /**
   * Tạo tên duy nhất: <testId>_<timestamp>_<actualName>
   */
  static generateUniqueName(scenarioName: string, actualName: string): string {
    const testId = this.generateTestId(scenarioName);
    const timestamp = Date.now(); // Add timestamp for uniqueness
    return `${testId}_${timestamp}_${actualName}`;
  }

  static generateUniqueAccountName(
    scenarioName: string,
    actualName: string
  ): string {
    return this.generateUniqueName(scenarioName, actualName);
  }

  static generateUniqueCategoryName(
    scenarioName: string,
    actualName: string
  ): string {
    return this.generateUniqueName(scenarioName, actualName);
  }

  // =======================
  // Sample factories
  // =======================

  static getTestAccount() {
    return {
      name: 'Test Account',
      type: 'Bank Account',
      balance: 1000,
      currency: 'US Dollar',
      description: 'Test account description',
    };
  }

  // =======================
  // Trackers
  // =======================

  /** Lưu tên account đã tạo */
  static trackCreatedAccount(accountName: string): void {
    if (accountName) this.createdAccounts.add(accountName);
  }

  /** Xóa tên account đã tạo */
  static removeCreatedAccount(accountName: string): void {
    if (accountName) this.createdAccounts.delete(accountName);
  }

  /** Lưu tên category đã tạo */
  static trackCreatedCategory(name: string): void {
    if (name) this.createdCategories.add(name);
    Logger.info(`[TestData] Tracked category: ${name} with Name: ${name}`);
  }

  /** Remove a category name from the tracker */
  static untrackCategory(name: string): void {
    if (name && this.createdCategories.has(name)) {
      this.createdCategories.delete(name);
      Logger.info(`[TestData] Untracked category: ${name}`);
    }
  }

  /** Lấy danh sách account đã tạo (copy) */
  static getAccounts(): string[] {
    return Array.from(this.createdAccounts);
  }

  /** Lấy danh sách categoryId đã tạo (copy) */
  static getCategories(): string[] {
    return Array.from(this.createdCategories);
  }

  /** Xoá hết tracker (dùng khi bắt đầu/hoặc sau cleanup) */
  static clear(): void {
    this.createdAccounts.clear();
    this.createdCategories.clear();
  }

  // =======================
  // Cleanup via API
  // =======================

  /**
   * Cleanup Accounts qua API.
   */
  static async cleanupAccountsViaApi(): Promise<void> {
    const accounts = this.getAccounts();
    if (!accounts.length) {
      Logger.debug('[TestData] No accounts to clean via API.');
      return;
    }

    const accountDeletionApiUseCase: AccountDeletionApiUseCase =
      getAccountDeletionApiUseCase() as AccountDeletionApiUseCase;
    Logger.info(`[TestData] Cleaning ${accounts.length} account(s) via API...`);

    for (const accountName of accounts) {
      try {
        await accountDeletionApiUseCase.deleteAccount(accountName);
        Logger.info(`[TestData] Deleted test account: ${accountName}`);
      } catch (error) {
        Logger.error(
          `[TestData] Failed to delete test account: ${accountName}`,
          error
        );
      }
    }

    this.createdAccounts.clear();
  }

  /**
   * Get all descendants of a category in deletion order (children first).
   */
  private static getDescendantsInDeletionOrder(
    category: CategoryResponse,
    allCategories: CategoryResponse[]
  ): CategoryResponse[] {
    const descendants: CategoryResponse[] = [];

    // Find direct children
    const children = allCategories.filter(cat => cat.parentId === category.id);

    // Recursively get descendants of each child
    for (const child of children) {
      descendants.push(
        ...this.getDescendantsInDeletionOrder(child, allCategories)
      );
    }

    // Add children after their descendants
    descendants.push(...children);

    return descendants;
  }

  /**
   * Cleanup Categories qua API.
   */
  static async cleanupCategoriesViaApi(): Promise<void> {
    const categoryNames = this.getCategories();
    if (!categoryNames.length) {
      Logger.debug('[TestData] No categories to clean via API.');
      return;
    }

    const categoryApiClient = getCategoryApiClient() as CategoryApiClient;
    Logger.info(
      `[TestData] Cleaning ${categoryNames.length} category(ies) via API...`
    );

    try {
      // Get all categories from API
      const allCategories = await categoryApiClient.getCategories();
      Logger.info(
        `[TestData] Found ${allCategories.length} total categories in API`
      );

      // Filter categories by the names we want to delete
      const categoriesToDelete = allCategories.filter(
        (category: CategoryResponse) => categoryNames.includes(category.name)
      );

      Logger.info(
        `[TestData] Found ${categoriesToDelete.length} categories to delete`
      );

      // Collect all categories to delete including descendants
      const allCategoriesToDelete: CategoryResponse[] = [];
      const processedIds = new Set<string>();

      for (const category of categoriesToDelete) {
        if (!processedIds.has(category.id)) {
          // Add descendants first (children before parents)
          const descendants = this.getDescendantsInDeletionOrder(
            category,
            allCategories
          );
          allCategoriesToDelete.push(...descendants);
          // Add the category itself
          allCategoriesToDelete.push(category);
          processedIds.add(category.id);
        }
      }

      // Remove duplicates while preserving order
      const uniqueCategoriesToDelete = allCategoriesToDelete.filter(
        (cat, index, arr) => arr.findIndex(c => c.id === cat.id) === index
      );

      Logger.info(
        `[TestData] Total categories to delete including descendants: ${uniqueCategoriesToDelete.length}`
      );

      // Delete each category by its actual ID in correct order
      for (const category of uniqueCategoriesToDelete) {
        try {
          await categoryApiClient.deleteCategory(category.id);
          Logger.info(
            `[TestData] Deleted test category: ${category.name} (ID: ${category.id})`
          );
        } catch (error) {
          Logger.error(
            `[TestData] Failed to delete test category: ${category.name} (ID: ${category.id})`,
            error
          );
        }
      }
    } catch (error) {
      Logger.error('[TestData] Failed to fetch categories from API', error);
    }

    this.createdCategories.clear();
  }

  /**
   * Cleanup tổng hợp cho cả Accounts & Categories (đều qua API).
   */
  static async cleanupAllViaApi(): Promise<void> {
    try {
      await this.cleanupAccountsViaApi();
    } catch (e) {
      Logger.error('[TestData] Error cleaning accounts via API', e);
    }

    try {
      await this.cleanupCategoriesViaApi();
    } catch (e) {
      Logger.error('[TestData] Error cleaning categories via API', e);
    }

    Logger.info('[TestData] Test data cleanup completed (API).');
  }
}
