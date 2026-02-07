import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { createAccount } from '@/actions/createAccount';
import { expectAccountExists } from '@/assertions/expectAccountExists';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';
import { givenAccountFormIsOpen, givenFormIsFilledWithValidData, whenUserSubmitsForm, thenFormShouldBeRejected } from './account-creation.scenario';

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

    // GIVEN: Network failure is simulated
    await app.accountPage.routeApiRequests('**/api/accounts', async (route) => {
      logger.warn('Network request aborted - simulating failure');
      await route.abort('failed');
    });

    // AND: Form is filled with valid data
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);
    
    // WHEN: User attempts to submit
    await whenUserSubmitsForm(app.accountPage);
    
    // THEN: Form should be rejected (dialog stays open)
    await thenFormShouldBeRejected(app.accountPage);

    // Cleanup: Restore network
    await app.accountPage.unrouteApiRequests('**/api/accounts');

    logger.success('Network failure handled gracefully');
  });

  test('should measure form submission performance', async ({ app, accountAPI }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Performance'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Form is filled
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);

    // WHEN: Measure submission performance
    const startTime = Date.now();
    await whenUserSubmitsForm(app.accountPage);

    const dialog = await app.accountPage.getCreateDialog();
    await expect(dialog).toBeHidden({ timeout: 10000 });

    const submissionTime = Date.now() - startTime;
    
    // THEN: Verify performance and account creation
    logger.info(`Submission completed in ${submissionTime}ms`);
    await expect(submissionTime).toBeLessThan(5000);

    await expectAccountExists(app.accountPage, account.name);
  });
});
