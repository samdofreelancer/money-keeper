import { Given } from '@cucumber/cucumber';
import { TestData } from '../../../shared/utilities/testData';
import { AccountCreateDto } from '../types/account.dto';
import {
  getAccountCreationApiUseCase,
  getAccountCreationUiUseCase,
} from '../../../shared/utilities/hooks';

/**
 * Step definitions for account existence setup
 * These steps create prerequisite accounts via direct backend API calls
 */
Given(
  'I have an existing account named {string}',
  async function (accountName: string) {
    const accountCreationApiUseCase = getAccountCreationApiUseCase();
    const accountCreationUiUseCase = getAccountCreationUiUseCase();
    
    // Get scenario name from context for unique naming
    const scenarioName =
      (this as { scenarioName?: string }).scenarioName || 'unknown-scenario';

    // Generate unique account name using the test data utility
    const uniqueAccountName = TestData.generateUniqueAccountName(
      scenarioName,
      accountName
    );

    // Create account data with default values
    const accountData = new AccountCreateDto({
      accountName: uniqueAccountName,
      initBalance: 1000,
      type: 'BANK_ACCOUNT',
      currency: 'USD',
      description: `Test account created for scenario: ${scenarioName}`,
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
