import { Given, When, Then } from '@cucumber/cucumber';
import {
  getAccountUsecase,
  getAccountsPage,
} from '../../../shared/utilities/hooks';
import { TestData } from '../../../shared/utilities/testData';
import { AccountData } from '../types/account.types';

Given('I am on the accounts page', async function () {
  const accountsPage = getAccountsPage();
  await accountsPage.navigate();
});

When('I click on the {string} button', async function (buttonText: string) {
  const accountUsecase = getAccountUsecase();
  if (buttonText === 'Add Account') {
    await accountUsecase.clickAddAccountButton();
  } else if (buttonText === 'Create') {
    await accountUsecase.clickCreateButton();
  }
});

When(
  'I fill in the account form with the following details:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const accountUsecase = getAccountUsecase();

    // Extract data from the dataTable
    const dataTableHash = dataTable.rowsHash();

    // Get scenario name from context
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';

    // Generate unique account name using TestData utility
    // Name should be unique by test case and formed by testId_actual name
    const accountData = new AccountData(
      TestData.generateUniqueAccountName(scenarioName, dataTableHash['Name']),
      dataTableHash['Type'],
      parseFloat(dataTableHash['Balance']),
      dataTableHash['Currency'],
      dataTableHash['Description']
    );

    // Track created account for cleanup
    TestData.trackCreatedAccount(accountData.name);

    await accountUsecase.fillAccountForm(accountData);
  }
);

Then(
  'I should see the account {string} in the accounts list',
  async function (accountName: string) {
    const accountUsecase = getAccountUsecase();
    await accountUsecase.verifyAccountCreated(accountName);
  }
);

Then(
  /^the total balance should include \$?([\d,]+\.\d{2})$/,
  async function (amountStr: string) {
    const cleaned = parseFloat(amountStr.replace(/,/g, ''));
    const accountUsecase = getAccountUsecase();
    await accountUsecase.verifyTotalBalance(cleaned);
  }
);
