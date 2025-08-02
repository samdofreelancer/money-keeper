import { Logger } from './logger';
import { AccountUsecase } from '../../domains/accounts/usecases/AccountUsecase';
import { getAccountUsecase } from './hooks';

/**
 * Test data utilities for generating test data
 */
export class TestData {
  private static createdAccounts: string[] = [];

  /**
   * Generate a test ID based on the scenario name
   * @param scenarioName The name of the test scenario
   * @returns A formatted test ID
   */
  static generateTestId(scenarioName: string): string {
    return scenarioName.toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')    // Remove special characters
      .substring(0, 100);             // Limit length
  }
  
  /**
   * Generate a unique account name based on scenario name and actual name
   * @param scenarioName The name of the test scenario
   * @param actualName The actual name from the data table
   * @returns A unique account name in the format testId_actualName
   */
  static generateUniqueAccountName(scenarioName: string, actualName: string): string {
    const testId = this.generateTestId(scenarioName);
    return `${testId}_${actualName}`;
  }

  /**
   * Generate account test data
   */
  static getTestAccount() {
    return {
      name: 'Test Account',
      type: 'Bank Account',
      balance: 1000,
      currency: 'US Dollar',
      description: 'Test account description'
    };
  }

  /**
   * Track a created account name for cleanup
   */
  static trackCreatedAccount(accountName: string): void {
    this.createdAccounts.push(accountName);
  }
  
  /**
   * Cleanup test data
   * This method can be called after each test scenario to clean up any test data
   */
  static async cleanupTestData(): Promise<void> {
    const accountUsecase: AccountUsecase = getAccountUsecase();
    for (const accountName of this.createdAccounts) {
      try {
        await accountUsecase.deleteAccount(accountName);
        Logger.info(`Deleted test account: ${accountName}`);
      } catch (error) {
        Logger.error(`Failed to delete test account: ${accountName}`, error);
      }
    }
    this.createdAccounts = [];
    Logger.info('Test data cleanup completed');
  }
}
