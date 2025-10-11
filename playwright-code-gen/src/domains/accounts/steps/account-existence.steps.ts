import { Given } from '@cucumber/cucumber';
import { TestData } from 'shared/utilities/testData';
import {
  getAccountCreationApiUseCase,
  getAccountCreationUiUseCase,
} from 'shared/utilities/hooks';
import { AccountCreateDto } from 'account-domains/types/account.dto';

/**
 * Step definitions for account existence setup
 * These steps create prerequisite accounts via direct backend API calls
 */
Given(
  'I have an existing account named {string}',
  async function (accountName: string) {
    const accountCreationApiUseCase = getAccountCreationApiUseCase();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();

    // Generate a unique account name using the TestData utility
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';
    const uniqueAccountName = TestData.generateUniqueAccountName(
      scenarioName,
      accountName
    );

    // Store both the original and unique names in world context for subsequent steps
    (this as { originalAccountName?: string }).originalAccountName =
      accountName;
    (this as { uniqueAccountName?: string }).uniqueAccountName =
      uniqueAccountName;

    const accountData = new AccountCreateDto({
      accountName: uniqueAccountName, // Use the unique name for actual creation
      initBalance: 1000,
      type: 'BANK_ACCOUNT',
      currency: 'USD',
      description: `Test account created for duplicate testing`,
    });

    // Track the created account for cleanup
    TestData.trackCreatedAccount(accountData.accountName);

    // Create the account directly via backend API
    await accountCreationApiUseCase.createAccount(accountData);

    // Reload the page to ensure the new account appears in the list
    await accountCreationUiUseCase.reloadAccountsPage();

    // Verify the newly created account is present in the account list
    await accountCreationUiUseCase.verifyAccountCreated(
      accountData.accountName
    );
  }
);

Given(
  'I have accounts named {string} and {string}',
  async function (name1: string, name2: string) {
    const accountCreationApiUseCase = getAccountCreationApiUseCase();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();

    // Generate unique names for both accounts
    const scenarioName = (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';
    const uniqueName1 = TestData.generateUniqueAccountName(scenarioName, name1);
    const uniqueName2 = TestData.generateUniqueAccountName(scenarioName, name2);

    const accountData1 = new AccountCreateDto({
      accountName: uniqueName1,
      initBalance: 1000,
      type: 'BANK_ACCOUNT',
      currency: 'USD',
      description: 'Test account 1 for duplicate name test',
    });

    const accountData2 = new AccountCreateDto({
      accountName: uniqueName2,
      initBalance: 1000,
      type: 'BANK_ACCOUNT',
      currency: 'USD',
      description: 'Test account 2 for duplicate name test',
    });

    // Track the created accounts for cleanup
    TestData.trackCreatedAccount(accountData1.accountName);
    TestData.trackCreatedAccount(accountData2.accountName);

    // Create the accounts directly via backend API
    await accountCreationApiUseCase.createAccount(accountData1);
    await accountCreationApiUseCase.createAccount(accountData2);

    // Reload the page to ensure the new accounts appear in the list
    await accountCreationUiUseCase.reloadAccountsPage();

    // Store both the original and unique names
    (this as { originalAccountName?: string }).originalAccountName = name1;
    (this as { uniqueAccountName?: string }).uniqueAccountName = uniqueName1;
    (this as { originalAccountName2?: string }).originalAccountName2 = name2;
    (this as { uniqueAccountName2?: string }).uniqueAccountName2 = uniqueName2;
  }
);
