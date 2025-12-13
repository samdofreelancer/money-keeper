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

      // Build a list of categories matching the names we want to delete.
      // There may be multiple categories with the same name; include them all.
      let categoriesToDelete: CategoryResponse[] = allCategories.filter(
        (category: CategoryResponse) => categoryNames.includes(category.name)
      );

      Logger.info(
        `[TestData] Found ${categoriesToDelete.length} categories to delete`
      );

      if (categoriesToDelete.length === 0) {
        // Nothing to do
      } else {
        // Create a map by id to allow walking parent chain.
        const mapById: Record<string, CategoryResponse> = {};
        for (const c of allCategories) {
          mapById[c.id] = c;
        }

        // Compute depth (distance from root) for each candidate. Deeper nodes (children) should be deleted first.
        const computeDepth = (cat: CategoryResponse): number => {
          let depth = 0;
          let current = cat;
          // Guard against cycles and extremely deep trees
          const maxDepth = 1000;
          while (current.parentId) {
            depth++;
            const parent = mapById[current.parentId as string];
            if (!parent) break; // parent not present in fetched list
            current = parent;
            if (depth > maxDepth) break;
          }
          return depth;
        };

        // Attach depth and sort descending (children before parents)
        categoriesToDelete = categoriesToDelete
          .map(c => ({ c, depth: computeDepth(c) }))
          .sort((a, b) => b.depth - a.depth)
          .map(x => x.c);

        Logger.info(
          `[TestData] Ordering categories for deletion (children first). Order: ${categoriesToDelete.map(c => `${c.name}(${c.id})`).join(', ')}`
        );

        // Attempt deletion in multiple passes to gracefully handle parent-child constraints.
        // We try the depth-ordered single pass first and only retry remaining items.
        const maxPasses = 5;
        for (
          let pass = 1;
          pass <= maxPasses && categoriesToDelete.length > 0;
          pass++
        ) {
          Logger.info(
            `[TestData] Deletion pass ${pass}, remaining ${categoriesToDelete.length}`
          );
          const remaining: CategoryResponse[] = [];

          for (const category of categoriesToDelete) {
            try {
              await categoryApiClient.deleteCategory(category.id);
              Logger.info(
                `[TestData] Deleted test category: ${category.name} (ID: ${category.id})`
              );
            } catch (error) {
              Logger.debug(
                `[TestData] Could not delete category (will retry later): ${category.name} (ID: ${category.id})`,
                error
              );
              remaining.push(category);
            }
          }

          // If nothing deleted in this pass, break to avoid infinite loop
          if (remaining.length === categoriesToDelete.length) {
            Logger.warn(
              '[TestData] No progress deleting categories on this pass; aborting further attempts'
            );
            break;
          }

          // Recompute order for remaining items in case parent-child relations changed.
          if (remaining.length > 0) {
            categoriesToDelete = remaining
              .map(c => ({ c, depth: computeDepth(c) }))
              .sort((a, b) => b.depth - a.depth)
              .map(x => x.c);
          } else {
            categoriesToDelete = [];
          }
        }

        if (categoriesToDelete.length > 0) {
          Logger.warn(
            `[TestData] Some categories could not be deleted after ${maxPasses} passes: ${categoriesToDelete.map(c => c.name).join(', ')}`
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
