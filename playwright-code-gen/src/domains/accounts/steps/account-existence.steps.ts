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
