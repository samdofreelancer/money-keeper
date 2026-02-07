import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';
import { openCreateDialog, fillAccountForm, attemptSubmit, assertFormRejected } from './account-creation.scenario';

/**
 * Account Creation - Network & Performance Tests
 * 
 * Tests network resilience, failure handling, and performance metrics
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Network & Performance', () => {
  test('should handle network failure gracefully', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'NetworkFail'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await app.accountPage.routeApiRequests('**/api/accounts', async (route) => {
      logger.warn('Network request aborted - simulating failure');
      await route.abort('failed');
    });

    await openCreateDialog(app.accountPage);
    await fillAccountForm(app.accountPage, account.name, account.initialBalance, account.currency);
    await attemptSubmit(app.accountPage);
    await assertFormRejected(app.accountPage);

    await app.accountPage.unrouteApiRequests('**/api/accounts');

    logger.success('Network failure handled gracefully');
  });

  test('should measure form submission performance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Performance'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    await openCreateDialog(app.accountPage);
    await fillAccountForm(app.accountPage, account.name, account.initialBalance, account.currency);

    const startTime = Date.now();
    
    await attemptSubmit(app.accountPage);

    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeHidden({ timeout: 10000 });

    const submissionTime = Date.now() - startTime;
    
    logger.info(`Submission completed in ${submissionTime}ms`);
    await expect(submissionTime).toBeLessThan(5000);

    await expectAccountExists(app.accountPage, account.name);
  });
});
