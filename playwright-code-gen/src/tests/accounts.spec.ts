import { test, expect } from '@playwright/test';
import { AccountsPage } from '../domains/accounts/pages/AccountsPage';
import { AccountUsecase } from '../domains/accounts/usecases/AccountUsecase';
import { TestData } from '@/shared/utilities/test-data';

test.describe('Account Management', () => {
  let accountsPage: AccountsPage;
  let accountUsecase: AccountUsecase;

  test.beforeEach(async ({ page }) => {
    accountsPage = new AccountsPage(page);
    accountUsecase = new AccountUsecase(accountsPage);
  });

  test('should create a new account successfully', async () => {
    // Given I am on the accounts page
    await accountsPage.navigate();

    // When I create a new account
    const testAccount = TestData.getTestAccount();
    await accountUsecase.createAccount(testAccount);

    // Then I should see the account in the list
    await accountUsecase.verifyAccountExists(testAccount.name);
    
    // And the total balance should be updated
    await accountUsecase.verifyTotalBalance(testAccount.balance);
  });
});