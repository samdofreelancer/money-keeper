import { test as base, expect } from '@playwright/test';
import { AccountPage } from '@/pages/AccountPage';
import { SettingsPage } from '@/pages/SettingsPage';

/**
 * Test fixture that provides all page objects and helpers
 * 
 * Extends base Playwright test with application-specific context.
 * All tests receive: app (page), accountPage, settingsPage
 */
export type AppFixture = {
  app: Awaited<ReturnType<typeof base>>;
  accountPage: AccountPage;
  settingsPage: SettingsPage;
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
});

export { expect };
