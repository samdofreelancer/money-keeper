import { test, expect } from '@/fixtures/test-fixture';
import { AccountBuilder } from '@/test-data/account.builder';
import { generateTestAccountName } from '@/test-data/test-name.util';
import { logger } from '@/utils/logger';
import { 
  givenAccountFormIsOpen, 
  givenFormIsFilledWithValidData, 
  givenNetworkFailureIsSimulated,
  whenUserSubmitsForm,
  whenNetworkIsRestored,
  thenFormShouldBeRejected,
  thenDialogShouldBeClosed,
  thenAccountShouldBeCreatedSuccessfully
} from './account-creation.scenario';

/**
 * Account Creation - Network & Performance Tests
 * 
 * Tests network resilience, failure handling, and performance metrics
 * ✅ Auto-cleanup: All TEST_ accounts deleted after each test
 */

test.describe('Account Creation / Network & Performance', () => {
  test('should handle network failure gracefully', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'NetworkFail'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Network failure is simulated
    await givenNetworkFailureIsSimulated(app.accountPage);

    // AND: Form is filled with valid data
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);
    
    // WHEN: User attempts to submit
    await whenUserSubmitsForm(app.accountPage);
    
    // THEN: Form should be rejected (dialog stays open)
    await thenFormShouldBeRejected(app.accountPage);

    // WHEN: Network is restored
    await whenNetworkIsRestored(app.accountPage);

    logger.success('Network failure handled gracefully');
  });

  test('should measure form submission performance', async ({ app }, testInfo) => {
    const account = AccountBuilder.create()
      .withName(generateTestAccountName(testInfo, 'Performance'))
      .withBalance(100_000)
      .withCurrency('USD')
      .build();

    // GIVEN: Form is filled
    await givenAccountFormIsOpen(app.accountPage);
    await givenFormIsFilledWithValidData(app.accountPage, account.name, account.initialBalance, account.currency);

    // WHEN: User submits form (measuring performance)
    const startTime = Date.now();
    await whenUserSubmitsForm(app.accountPage);
    await thenDialogShouldBeClosed(app.accountPage);
    const submissionTime = Date.now() - startTime;
    
    // THEN: Verify submission performance
    logger.info(`Submission completed in ${submissionTime}ms`);
    await expect(submissionTime).toBeLessThan(5000);

    // AND: Account should be created
    await thenAccountShouldBeCreatedSuccessfully(app.accountPage, account.name);
  });
});
