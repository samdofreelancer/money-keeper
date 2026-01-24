import { Given, When, Then } from '@cucumber/cucumber';
import {
  getAccountCreationApiUseCase,
  getAccountUpdateUiUseCase,
  getAccountsPage,
  getAccountSortingVerificationUiUseCase,
} from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';
import {
  AccountDto,
  AccountCreateDto,
} from 'account-domains/types/account.dto';

Given(
  'I have the following accounts:',
  async function (dataTable: { hashes: () => Array<Record<string, string>> }) {
    const rows = dataTable.hashes();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName ||
      'search-filter-scenario';

    // Mapping for account types to match backend enum values
    const typeMapping: Record<string, string> = {
      'Bank Account': 'BANK_ACCOUNT',
      'Credit Card': 'CREDIT_CARD',
      Cash: 'CASH',
      'E-Wallet': 'E_WALLET',
    };

    for (const row of rows) {
      const mappedType = typeMapping[row.type] || row.type; // Fallback to original if not mapped

      const accountData: AccountDto = {
        name: TestData.generateUniqueAccountName(scenarioName, row.name),
        type: mappedType,
        balance: Number(row.balance),
        currency: row.currency || 'US Dollar',
      };

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
  if (!(await accountsPage.isSuccessMessageVisible())) {
    throw new Error('Success message not visible');
  }
});

Then(
  'I should see the error message {string}',
  async function (errorMessage: string) {
    const accountsPage = getAccountsPage();
    if (!(await accountsPage.isErrorMessageVisible(errorMessage))) {
      throw new Error(`Error message "${errorMessage}" not visible`);
    }
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

    // Get the unique account name that was generated in the background step
    const uniqueAccountName = (this as { uniqueAccountName?: string })
      .uniqueAccountName;
    if (!uniqueAccountName) {
      throw new Error(
        'No existing account name found in test context. Make sure "I have an existing account named" step was executed.'
      );
    }

    const accountData: AccountDto = {
      name: dataTableHash['name'],
      type: dataTableHash['type'],
      balance: Number(dataTableHash['balance']),
      currency: dataTableHash['currency'],
      description: dataTableHash['description'],
    };

    await accountUpdateUiUseCase.updateAccount(uniqueAccountName, accountData);
    // Track the updated account name for cleanup
    TestData.trackCreatedAccount(accountData.name);
    // Remove the old account name from tracking to avoid leftover data
    TestData.removeCreatedAccount(uniqueAccountName);
  }
);

Then(
  'I should see the success message {string}',
  async function (expectedMessage: string) {
    const accountsPage = getAccountsPage();
    const isVisible = await accountsPage.isSuccessMessageVisible();
    if (!isVisible) {
      throw new Error(`Success message "${expectedMessage}" not visible`);
    }
    const actualMessage = await accountsPage.getSuccessMessageText();
    if (actualMessage !== expectedMessage) {
      throw new Error(
        `Expected success message "${expectedMessage}", but got "${actualMessage}"`
      );
    }
  }
);

Then(
  'the account {string} should have a balance of {string}',
  async function (accountName: string, expectedBalance: string) {
    const accountsPage = getAccountsPage();
    const actualBalance =
      await accountsPage.getAccountBalanceForRow(accountName);
    if (actualBalance !== expectedBalance) {
      throw new Error(
        `Expected balance "${expectedBalance}" for account "${accountName}", but got "${actualBalance}"`
      );
    }
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
      if (!name.includes(expectedAccountName)) {
        throw new Error(
          `Account "${name}" does not contain "${expectedAccountName}"`
        );
      }
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
    const balances = await getAccountsPage().getAccountBalances();
    const sortOrder = order === 'ascending' ? 'asc' : 'desc';
    await getAccountSortingVerificationUiUseCase().verifyAccountsSortedByBalance(
      balances,
      sortOrder
    );
  }
);

Given(
  'I have accounts named {string} and {string}',
  async function (accountName1: string, accountName2: string) {
    const accountCreationApiUseCase = getAccountCreationApiUseCase();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'multi-account-scenario';

    // Create first account
    const uniqueName1 = TestData.generateUniqueAccountName(
      scenarioName,
      accountName1
    );
    const account1Data: AccountDto = {
      name: uniqueName1,
      type: 'BANK_ACCOUNT',
      balance: 1000,
      currency: 'USD',
    };
    TestData.trackCreatedAccount(uniqueName1);
    await accountCreationApiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(account1Data)
    );

    // Create second account
    const uniqueName2 = TestData.generateUniqueAccountName(
      scenarioName,
      accountName2
    );
    const account2Data: AccountDto = {
      name: uniqueName2,
      type: 'BANK_ACCOUNT',
      balance: 2000,
      currency: 'USD',
    };
    TestData.trackCreatedAccount(uniqueName2);
    await accountCreationApiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(account2Data)
    );

    // Store names for later verification
    (this as { accountNames?: string[] }).accountNames = [uniqueName1, uniqueName2];
  }
);

Given('I have accounts of different types', async function () {
  const accountCreationApiUseCase = getAccountCreationApiUseCase();
  const scenarioName =
    (this as { scenarioName?: string }).scenarioName || 'type-scenario';

  const accountTypes = [
    { name: 'Bank Account', type: 'BANK_ACCOUNT' },
    { name: 'Credit Card', type: 'CREDIT_CARD' },
    { name: 'Cash', type: 'CASH' },
    { name: 'E-Wallet', type: 'E_WALLET' },
  ];

  for (const account of accountTypes) {
    const uniqueName = TestData.generateUniqueAccountName(
      scenarioName,
      account.name
    );
    const accountData: AccountDto = {
      name: uniqueName,
      type: account.type,
      balance: 1000,
      currency: 'USD',
    };
    TestData.trackCreatedAccount(uniqueName);
    await accountCreationApiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
});

Given('I have multiple accounts with different names', async function () {
  const accountCreationApiUseCase = getAccountCreationApiUseCase();
  const scenarioName =
    (this as { scenarioName?: string }).scenarioName || 'name-sort-scenario';

  const accountNames = [
    'Zebra Savings',
    'Apple Checking',
    'Mango E-Wallet',
    'Banana Cash',
  ];

  for (const name of accountNames) {
    const uniqueName = TestData.generateUniqueAccountName(scenarioName, name);
    const accountData: AccountDto = {
      name: uniqueName,
      type: 'BANK_ACCOUNT',
      balance: 1000,
      currency: 'USD',
    };
    TestData.trackCreatedAccount(uniqueName);
    await accountCreationApiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
});

Given('I have multiple accounts', async function () {
  const accountCreationApiUseCase = getAccountCreationApiUseCase();
  const scenarioName =
    (this as { scenarioName?: string }).scenarioName || 'all-accounts-scenario';

  const accounts = [
    { name: 'Account One', balance: 1000 },
    { name: 'Account Two', balance: 2000 },
    { name: 'Account Three', balance: 3000 },
  ];

  for (const account of accounts) {
    const uniqueName = TestData.generateUniqueAccountName(
      scenarioName,
      account.name
    );
    const accountData: AccountDto = {
      name: uniqueName,
      type: 'BANK_ACCOUNT',
      balance: account.balance,
      currency: 'USD',
    };
    TestData.trackCreatedAccount(uniqueName);
    await accountCreationApiUseCase.createAccount(
      AccountCreateDto.fromAccountDto(accountData)
    );
  }
});

When('I navigate to the accounts page', async function () {
  const accountsPage = getAccountsPage();
  await accountsPage.navigateToAccountsPage();
});

Then('I should see all accounts listed', async function () {
  const accountsPage = getAccountsPage();
  const count = await accountsPage.getTotalAccountCount();
  if (count === 0) {
    throw new Error('No accounts are listed on the accounts page');
  }
});

Then(
  /^the accounts should be sorted by name in (ascending|descending) order$/,
  async function (order: string) {
    const accountsPage = getAccountsPage();
    const names = await accountsPage.getVisibleAccountNames();

    const sortedNames = [...names].sort();
    const reverseSortedNames = [...names].sort().reverse();

    if (order === 'ascending') {
      if (JSON.stringify(names) !== JSON.stringify(sortedNames)) {
        throw new Error(
          `Accounts are not sorted by name in ascending order. Got: ${names.join(', ')}, Expected: ${sortedNames.join(', ')}`
        );
      }
    } else if (order === 'descending') {
      if (JSON.stringify(names) !== JSON.stringify(reverseSortedNames)) {
        throw new Error(
          `Accounts are not sorted by name in descending order. Got: ${names.join(', ')}, Expected: ${reverseSortedNames.join(', ')}`
        );
      }
    }
  }
);

Then(
  /^the accounts should be sorted by type in (ascending|descending) order$/,
  async function (order: string) {
    // This would require getting account types from the UI
    // For now, we'll provide a placeholder
    throw new Error(
      'Type sorting verification requires extending AccountsDataRetrieval.getAccountTypes(). This step is a placeholder.'
    );
  }
);

Then('the total balance should be {string}', async function (expectedTotal: string) {
  const accountsPage = getAccountsPage();
  const actualTotal = await accountsPage.getTotalBalance();

  // Normalize the expected total (remove currency symbol if present)
  const expectedNum = parseFloat(expectedTotal.replace(/[$€₫]/g, '').replace(/,/g, ''));
  const actualNum = parseFloat(actualTotal.replace(/[$€₫]/g, '').replace(/,/g, ''));

  if (Math.abs(expectedNum - actualNum) > 0.01) {
    throw new Error(
      `Expected total balance "${expectedTotal}", but got "${actualTotal}"`
    );
  }
});

Then('the account {string} should still exist', async function (accountName: string) {
  const accountsPage = getAccountsPage();
  const uniqueAccountName = (this as { uniqueAccountName?: string })
    .uniqueAccountName || accountName;

  const exists = await accountsPage.verifyAccountIsListed(uniqueAccountName);
  if (!exists) {
    throw new Error(
      `Account "${uniqueAccountName}" should exist but was not found`
    );
  }
});

Given(
  /^I have accounts with balances \$(\d+), \$(\d+), \$(\d+)$/,
  async function (balance1: string, balance2: string, balance3: string) {
    const accountCreationApiUseCase = getAccountCreationApiUseCase();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'balance-scenario';

    const balances = [
      parseFloat(balance1),
      parseFloat(balance2),
      parseFloat(balance3),
    ];

    for (let i = 0; i < balances.length; i++) {
      const uniqueName = TestData.generateUniqueAccountName(
        scenarioName,
        `Balance Account ${i + 1}`
      );
      const accountData: AccountDto = {
        name: uniqueName,
        type: 'BANK_ACCOUNT',
        balance: balances[i],
        currency: 'USD',
      };
      TestData.trackCreatedAccount(uniqueName);
      await accountCreationApiUseCase.createAccount(
        AccountCreateDto.fromAccountDto(accountData)
      );
    }
  }
);

When('I view the accounts page', async function () {
  const accountsPage = getAccountsPage();
  await accountsPage.navigateToAccountsPage();
});
