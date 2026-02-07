import { test as base, expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AccountAPI } from '@/api/AccountAPI';
import { logger } from '@/utils/logger';

/**
 * Test Fixture
 *
 * Provides all page objects and helpers to tests.
 * Automatically cleans up test accounts after each test.
 *
 * Usage:
 *   test('should do something', async ({ app, accountAPI }) => {
 *     const account = AccountBuilder.create().withName('TEST_Account').build();
 *     await createAccount(app.accountPage, account);
 *   });
 */

export interface AppContext {
  accountPage: AccountPage;
  settingsPage: SettingsPage;
}

export type AppFixture = {
  app: AppContext;
  accountAPI: AccountAPI;
};

export const test = base.extend<AppFixture>({
  app: async ({ page }, use) => {
    const appContext: AppContext = {
      accountPage: new AccountPage(page),
      settingsPage: new SettingsPage(page),
    };
    await use(appContext);
  },

  accountAPI: async ({}, use) => {
    const accountAPI = new AccountAPI();
    await use(accountAPI);

    // ===== CLEANUP HOOK =====
    // After test completes, delete all test accounts (TEST_ prefix)
    logger.info('Running cleanup hook...');
    const deleted = await accountAPI.cleanupTestAccounts('TEST_');
    if (deleted > 0) {
      logger.success(`Cleanup: Deleted ${deleted} test account(s)`);
    } else {
      logger.warn('Cleanup: No test accounts found to delete');
    }
  },
});

export { expect };

