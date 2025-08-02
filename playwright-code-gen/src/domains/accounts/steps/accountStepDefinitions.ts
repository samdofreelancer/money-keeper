import { Given, When, Then } from '@cucumber/cucumber';
import { TestData } from '../../../shared/utilities/testData';
import { getAccountsPage, getAccountUsecase } from '../../../shared/utilities/hooks';

Given('I am on the accounts page', async function() {
  const accountUsecase = getAccountUsecase();
  await accountUsecase.navigateToAccountsPage();
});

When('I click on the {string} button', async function(buttonText: string) {
  const accountsPage = getAccountsPage();
  if (buttonText === 'Add Account') {
    await accountsPage.clickAddAccount();
  } else if (buttonText === 'Create') {
    await accountsPage.clickCreate();
  }
});

When('I fill in the account form with the following details:', async function(dataTable) {
  const accountsPage = getAccountsPage();
  const testAccount = TestData.getTestAccount();
  await accountsPage.fillAccountForm(testAccount);
});

Then('I should see the account {string} in the accounts list', async function(accountName: string) {
  const accountUsecase = getAccountUsecase();
  await accountUsecase.verifyAccountCreated(accountName);
});

Then(/^the total balance should include \$?([\d,]+\.\d{2})$/, async function (amountStr: string) {
    const cleaned = parseFloat(amountStr.replace(/,/g, ''));
    const accountUsecase = getAccountUsecase();
    await accountUsecase.verifyTotalBalance(cleaned);
  });
