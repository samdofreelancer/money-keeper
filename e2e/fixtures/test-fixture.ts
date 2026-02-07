import { test as base, expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AccountAPI } from '@/api/AccountAPI';
import { logger } from '@/utils/logger';

/**
 * Test fixture that provides all page objects and helpers
 * 
 * Extends base Playwright test with application-specific context.
 * All tests receive: app (page), accountPage, settingsPage, accountAPI
 * 
 * Automatically cleans up test accounts after each test using structured logging.
 */
export type AppFixture = {
  app: Awaited<ReturnType<typeof base>>;
  accountPage: AccountPage;
  settingsPage: SettingsPage;
  accountAPI: AccountAPI;
};

export const test = base.extend<AppFixture>({
  accountPage: async ({ page }, use) => {
    const accountPage = new AccountPage(page);
    await use(accountPage);
  },

  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  accountAPI: async ({}, use) => {
    const accountAPI = new AccountAPI();
    await use(accountAPI);

    // ===== CLEANUP HOOK =====
    // After test completes, delete all test accounts
    // Test accounts have TEST_ prefix in name
    const deleted = await accountAPI.cleanupTestAccounts('TEST_');
    if (deleted > 0) {
      logger.success(`Cleanup: Deleted ${deleted} test account(s)`);
    }
  },
});

export { expect };
