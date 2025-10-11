import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  getAccountCreationApiUseCase,
  getAccountUpdateUiUseCase,
  getAccountsPage,
} from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';
import {
  AccountDto,
  AccountCreateDto,
  ACCOUNT_TYPE_MAPPING,
} from 'account-domains/types/account.dto';

Given(
  'I have the following accounts:',
  async function (dataTable: { hashes: () => Array<Record<string, string>> }) {
    const rows = dataTable.hashes();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName ||
      'search-filter-scenario';

    // Create accounts with unique names to avoid conflicts across tests
    for (const row of rows) {
      const mappedType = ACCOUNT_TYPE_MAPPING[row.type] || row.type; // Fallback to original if not mapped

      const accountData: AccountDto = {
        name: TestData.generateUniqueAccountName(scenarioName, row.name),
        type: mappedType,
        balance: Number(row.balance),
        currency: row.currency || 'US Dollar',
      };

      // Track created accounts for cleanup after test
      TestData.trackCreatedAccount(accountData.name);

      const accountCreationUiUseCase = getAccountCreationApiUseCase();
      await accountCreationUiUseCase.createAccount(
        AccountCreateDto.fromAccountDto(accountData)
      );
    }
  }
);

When(
  'I navigate to accounts via clicking {string}',
  async function (tabName: string) {
    const accountsPage = getAccountsPage();
    if (tabName === 'Accounts') {
      await accountsPage.clickAccountsTab();
    }
  }
);

When(
  'I create a new account with the following details:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const dataTableHash = dataTable.rowsHash();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';

    const accountData: AccountDto = {
      name: TestData.generateUniqueAccountName(
        scenarioName,
        dataTableHash['Name']
      ),
      type: dataTableHash['Type'],
      balance: Number(dataTableHash['Balance']) || 1000,
      currency: dataTableHash['Currency'],
      description: dataTableHash['Description'],
    };

    TestData.trackCreatedAccount(accountData.name);

    const accountCreationUiUseCase = getAccountCreationApiUseCase();
    await accountCreationUiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
);

When(
  'I try to create the same account again with the following details:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const dataTableHash = dataTable.rowsHash();

    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';

    const accountData: AccountDto = {
      name: TestData.generateUniqueAccountName(
        scenarioName,
        dataTableHash['Name']
      ),
      type: dataTableHash['Type'],
      balance: Number(dataTableHash['Balance']) || 1000,
      currency: dataTableHash['Currency'],
      description: dataTableHash['Description'],
    };

    const accountCreationUiUseCase = getAccountCreationApiUseCase();
    await accountCreationUiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
);

Then('I should see a success message', async function () {
  const accountsPage = getAccountsPage();
  expect(await accountsPage.isSuccessMessageVisible()).toBe(true);
});

Then(
  'I should see the error message {string}',
  async function (errorMessage: string) {
    const accountsPage = getAccountsPage();
    expect(await accountsPage.isErrorMessageVisible(errorMessage)).toBe(true);
  }
);

When(
  'I edit the account {string} with:',
  async function (
    oldName: string,
    dataTable: { rowsHash: () => Record<string, string> }
  ) {
    const dataTableHash = dataTable.rowsHash();
    const accountUpdateUiUseCase = getAccountUpdateUiUseCase();

    // Retrieve the unique account name generated in the background step
    const uniqueAccountName = (this as { uniqueAccountName?: string })
      .uniqueAccountName;
    if (!uniqueAccountName) {
      throw new Error(
        'No existing account name found in test context. Ensure "I have an existing account named" step was executed.'
      );
    }

    // Handle updates to duplicate names by using unique versions from context
    const logicalNewName = dataTableHash['name'];
    const originalAccountName2 = (this as { originalAccountName2?: string })
      .originalAccountName2;
    const uniqueName2 = (this as { uniqueAccountName2?: string })
      .uniqueAccountName2;
    const newName =
      logicalNewName === originalAccountName2 && uniqueName2
        ? uniqueName2
        : logicalNewName;
    const accountData: AccountDto = {
      name: newName,
      type: dataTableHash['type'], // Retain as display text for UI compatibility
      balance: Number(dataTableHash['balance']),
      currency: dataTableHash['currency'],
      description: dataTableHash['description'],
    };

    const success = await accountUpdateUiUseCase.updateAccount(
      uniqueAccountName,
      accountData
    );

    // Update test data tracking: add new name and remove old if successful
    if (success) {
      TestData.trackCreatedAccount(accountData.name);
      TestData.removeCreatedAccount(uniqueAccountName);
    }
  }
);

Then(
  'I should see the success message {string}',
  async function (expectedMessage: string) {
    const accountsPage = getAccountsPage();
    expect(await accountsPage.isSuccessMessageVisible()).toBe(true);
    expect(await accountsPage.getSuccessMessageText()).toBe(expectedMessage);
  }
);

Then(
  'the account {string} should have a balance of {string}',
  async function (accountName: string, expectedBalance: string) {
    const accountsPage = getAccountsPage();
    const actualBalance =
      await accountsPage.getAccountBalanceForRow(accountName);
    expect(actualBalance).toBe(expectedBalance);
  }
);

When(
  'I search for accounts containing {string}',
  async function (query: string) {
    const accountsPage = getAccountsPage();
    await accountsPage.searchAccounts(query);
  }
);

Then(
  'only the account {string} is shown',
  async function (expectedAccountName: string) {
    const accountsPage = getAccountsPage();
    const visibleNames = await accountsPage.getVisibleAccountNames();
    for (const name of visibleNames) {
      expect(name).toContain(expectedAccountName);
    }
  }
);

Given('I have multiple accounts with different balances', async function () {
  const accountCreationApiUseCase = getAccountCreationApiUseCase();
  const scenarioName =
    (this as { scenarioName?: string }).scenarioName || 'sort-scenario';
  const accounts = [
    { name: 'Account A', balance: 1000, currency: 'USD', type: 'BANK_ACCOUNT' },
    { name: 'Account B', balance: 500, currency: 'USD', type: 'BANK_ACCOUNT' },
    { name: 'Account C', balance: 2000, currency: 'USD', type: 'BANK_ACCOUNT' },
  ];

  for (const account of accounts) {
    const accountData: AccountDto = {
      name: TestData.generateUniqueAccountName(scenarioName, account.name),
      type: account.type,
      balance: account.balance,
      currency: account.currency,
    };
    TestData.trackCreatedAccount(accountData.name);
    await accountCreationApiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
});

When(
  /^I click the "([^"]*)" column header(?: again)?$/,
  async function (columnName: string) {
    const accountsPage = getAccountsPage();
    await accountsPage.clickColumnHeader(columnName);
  }
);

Then(
  'the accounts should be sorted by balance in {string} order',
  async function (order: 'ascending' | 'descending') {
    const accountsPage = getAccountsPage();
    const balances = await accountsPage.getAccountBalances();
    const sortedBalances = [...balances].sort((a, b) =>
      order === 'ascending' ? a - b : b - a
    );
    for (let i = 0; i < balances.length; i++) {
      expect(balances[i]).toBe(sortedBalances[i]);
    }
  }
);
