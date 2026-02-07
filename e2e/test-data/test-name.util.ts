import { TestInfo } from '@playwright/test';

/**
 * Test Data Name Generator Utility
 *
 * Generates unique test account names with format:
 * TEST_{testScenario}_{accountType}_{timestamp}
 *
 * Examples:
 *   generateTestAccountName(testInfo, 'Savings')
 *   => TEST_should_create_account_with_initial_balance_Savings_1738939123456
 *
 *   generateTestName(testInfo)
 *   => TEST_should_create_account_with_initial_balance_1738939123456
 */

/**
 * Convert test title to snake_case format
 * 'should create account with initial balance' => 'should_create_account_with_initial_balance'
 */
function testTitleToSnakeCase(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Generate a unique test account name with timestamp suffix
 * Automatically extracts test name from TestInfo
 * @param testInfo - Playwright TestInfo object (available as parameter in test function)
 * @param accountType - The account type (e.g., 'Savings', 'Account', 'VND')
 * @returns Unique account name with TEST_ prefix and timestamp
 *
 * Usage in test:
 *   test('should create account with initial balance', async ({ app, accountAPI }, testInfo) => {
 *     const name = generateTestAccountName(testInfo, 'Savings');
 */
export function generateTestAccountName(testInfo: TestInfo, accountType: string): string {
  const timestamp = Date.now();
  const testScenario = testTitleToSnakeCase(testInfo.title);
  return `TEST_${testScenario}_${accountType}_${timestamp}`;
}

/**
 * Generate a unique test account name using just the test scenario
 * Automatically extracts test name from TestInfo
 * @param testInfo - Playwright TestInfo object
 * @returns Unique account name
 *
 * Usage in test:
 *   test('should create account', async ({ app, accountAPI }, testInfo) => {
 *     const name = generateTestName(testInfo);
 */
export function generateTestName(testInfo: TestInfo): string {
  const timestamp = Date.now();
  const testScenario = testTitleToSnakeCase(testInfo.title);
  return `TEST_${testScenario}_${timestamp}`;
}
