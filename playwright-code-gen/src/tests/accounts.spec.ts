import { test, expect } from '@playwright/test';
import { TestData } from '../shared/utilities/testData';
import { AccountsPage } from '../domains/accounts/pages/AccountsPage';
import { AccountSteps } from '../domains/accounts/steps/accountSteps';

test.describe('Account Management', () => {
  let accountsPage: AccountsPage;
  let accountSteps: AccountSteps;

  test.beforeEach(async ({ page }) => {
    accountsPage = new AccountsPage(page);
    accountSteps = new AccountSteps(accountsPage);
  });

  test('should create a new account successfully', async () => {
    // Given I am on the accounts page
    await accountSteps.navigateToAccountsPage();

    // When I create a new account
    const testAccount = TestData.getTestAccount();
    await accountSteps.createNewAccount(testAccount);

    // Then I should see the account in the list
    await accountSteps.verifyAccountCreated(testAccount.name);
    
    // And the total balance should be updated
    await accountSteps.verifyTotalBalance(testAccount.balance);
  });
});