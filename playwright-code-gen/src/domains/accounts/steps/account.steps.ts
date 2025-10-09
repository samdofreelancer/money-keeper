import { Given, When, Then } from '@cucumber/cucumber';
import {
  getAccountCreationApiUseCase,
  getAccountUpdateUiUseCase,
  getAccountsPage,
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
