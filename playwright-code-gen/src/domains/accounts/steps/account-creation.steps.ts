import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  getAccountCreationUiUseCase,
  getAccountsPage,
} from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';
import { AccountDto } from 'account-domains/types/account.dto';
import { generateStringOfLength } from 'shared/utilities/stringHelpers';

Given('I am logged into the money management system', async function () {
  const accountsPage = getAccountsPage();
  await accountsPage.navigateToAccountsPage();
});

When(
  'I create a new account with:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const data = dataTable.rowsHash();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();

    // Store original name for verification
    (this as { originalAccountName?: string }).originalAccountName =
      data['name'];

    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';
    const uniqueAccountName = TestData.generateUniqueAccountName(
      scenarioName,
      data['name']
    );

    // Store generated name for later steps
    (this as { uniqueAccountName?: string }).uniqueAccountName =
      uniqueAccountName;

    const accountData: AccountDto = {
      name: uniqueAccountName,
      type: data['type'],
      balance: Number(data['balance']) || 0,
      currency: data['currency'],
      description: data['description'] || '',
    };

    TestData.trackCreatedAccount(accountData.name);
    await accountCreationUiUseCase.createAccount(accountData);
  }
);

When(
  'I attempt to create another account with:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const data = dataTable.rowsHash();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();

    // Get the unique account name that was generated and used in the previous step
    const uniqueAccountName = (this as { uniqueAccountName?: string })
      .uniqueAccountName;
    if (!uniqueAccountName) {
      throw new Error(
        'No existing account name found in test context. Make sure "I have an existing account named" step was executed.'
      );
    }

    const accountData: AccountDto = {
      name: uniqueAccountName, // Use the same unique name to test duplicate handling
      type: data['type'],
      balance: Number(data['balance']) || 0,
      currency: data['currency'],
      description: data['description'] || '',
    };

    await accountCreationUiUseCase.createAccount(accountData);
  }
);

When(
  'I attempt to create a new account without providing a name',
  async function () {
    const accountCreationUiUseCase = getAccountCreationUiUseCase();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';
    const uniqueAccountName = TestData.generateUniqueAccountName(
      scenarioName,
      ''
    );

    const accountData: AccountDto = {
      name: uniqueAccountName,
      type: 'BANK_ACCOUNT',
      balance: 1000,
      currency: 'USD',
      description: 'Test account',
    };

    await accountCreationUiUseCase.createAccount(accountData);
  }
);

When(
  'I attempt to create a new account with:',
  async function (dataTable: { rowsHash: () => Record<string, string> }) {
    const data = dataTable.rowsHash();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();

    // For validation scenarios, use the name as is (e.g., empty string to trigger validation)
    let accountName = data['name'];
    if (accountName.trim() === '') {
      // Keep empty for validation
    } else {
      // Generate unique name for other cases
      const scenarioName =
        (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';
      accountName = TestData.generateUniqueAccountName(
        scenarioName,
        data['name']
      );
    }

    // Store generated name for later steps
    (this as { uniqueAccountName?: string }).uniqueAccountName = accountName;

    const accountData: AccountDto = {
      name: accountName,
      type: data['type'],
      balance: Number(data['balance']) || 0,
      currency: data['currency'],
      description: data['description'] || '',
    };

    // Use helper to generate long strings if special placeholders are used
    if (data['name'] === 'LONG_NAME') {
      accountData.name = generateStringOfLength(256);
    }
    if (data['description'] === 'LONG_DESCRIPTION') {
      accountData.description = generateStringOfLength(1001);
    }

    await accountCreationUiUseCase.createAccount(accountData);
  }
);

Then(
  'I should see the account {string} in my accounts list',
  async function (accountName: string) {
    const accountsPage = getAccountsPage();
    // Use the stored unique account name from previous steps
    const uniqueAccountName =
      (this as { uniqueAccountName?: string }).uniqueAccountName || accountName;

    const exists = await accountsPage.verifyAccountIsListed(uniqueAccountName);
    expect(exists).toBe(true);
  }
);

Then(
  'the account should have a balance of {string}',
  async function (expectedBalance: string) {
    const accountsPage = getAccountsPage();
    const uniqueAccountName = (this as { uniqueAccountName?: string })
      .uniqueAccountName;
    if (!uniqueAccountName) {
      throw new Error('No account name found in test context');
    }
    const actualBalance =
      await accountsPage.getAccountBalanceForRow(uniqueAccountName);
    expect(actualBalance).toBe(expectedBalance);
  }
);

Then(
  'I should see an error message {string}',
  async function (errorMessage: string) {
    const accountsPage = getAccountsPage();
    expect(await accountsPage.isErrorMessageVisible(errorMessage)).toBe(true);
  }
);

Then(
  'the account {string} should appear only once in my accounts list',
  async function (accountName: string) {
    const accountsPage = getAccountsPage();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();

    // Reload the page to ensure we have the latest state
    await accountCreationUiUseCase.reloadAccountsPage();

    // Get the stored unique account name from previous steps
    const uniqueAccountName = (this as { uniqueAccountName?: string })
      .uniqueAccountName;
    if (!uniqueAccountName) {
      throw new Error('No existing account name found in test context');
    }

    if (uniqueAccountName.includes(accountName)) {
      const count = await accountsPage.getAccountCount(uniqueAccountName);
      expect(count).toBe(1);
    } else {
      expect(uniqueAccountName).toContain(accountName);
    }
  }
);

Then(
  'I should see a validation error {string}',
  async function (errorMessage: string) {
    const accountsPage = getAccountsPage();
    const isVisible = await accountsPage.isErrorMessageVisible(errorMessage);
    if (!isVisible) {
      throw new Error(`Validation error "${errorMessage}" not visible`);
    }
  }
);

Then('the account should not be created', async function () {
  const accountsPage = getAccountsPage();
  const accountCount = await accountsPage.getTotalAccountCount();
  if (accountCount > 0) {
    throw new Error('An account was created when it should not have been');
  }
  // This would need to be implemented based on expected behavior
});

Then(
  'the account should display the balance in {string}',
  async function (currency: string) {
    const accountsPage = getAccountsPage();
    const balanceText = await accountsPage.getTotalBalance();
    if (!balanceText.includes(currency)) {
      throw new Error(`Balance does not display in ${currency}`);
    }
  }
);

Then(
  'the account description should be {string}',
  async function (expectedDescription: string) {
    const accountsPage = getAccountsPage();
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';
    const uniqueAccountName = TestData.generateUniqueAccountName(
      scenarioName,
      'test-account'
    );

    const description =
      await accountsPage.getAccountDescription(uniqueAccountName);
    if (description !== expectedDescription) {
      throw new Error(
        `Expected description "${expectedDescription}", but found "${description}"`
      );
    }
  }
);
