import { When, Then, Given } from '@cucumber/cucumber';
import { getAccountsPage } from 'shared/utilities/hooks';
import { TestData } from 'shared/utilities/testData';

/**
 * Step definitions for account deletion scenarios
 */

When('I delete the account {string}', async function () {
  const accountsPage = getAccountsPage();
  // Get the unique account name that was generated in previous steps
  const uniqueAccountName = (this as { uniqueAccountName?: string })
    .uniqueAccountName;
  if (!uniqueAccountName) {
    throw new Error(
      'No account name found in test context. Make sure "I have an existing account named" or "I create" step was executed.'
    );
  }

  await accountsPage.deleteAccount(uniqueAccountName);
  // Remove the account from tracking since it's deleted
  TestData.removeCreatedAccount(uniqueAccountName);
});

When('I attempt to delete the account', async function () {
  const accountsPage = getAccountsPage();
  const uniqueAccountName = (this as { uniqueAccountName?: string })
    .uniqueAccountName;
  if (!uniqueAccountName) {
    throw new Error('No account name found in test context');
  }

  try {
    await accountsPage.deleteAccount(uniqueAccountName);
  } catch (error) {
    // Store the error for later assertion
    (this as { deletionError?: Error }).deletionError = error as Error;
  }
});

Then(
  'the account {string} should not be in my accounts list',
  async function (accountName: string) {
    const accountsPage = getAccountsPage();
    // Use the stored unique account name
    const uniqueAccountName =
      (this as { uniqueAccountName?: string }).uniqueAccountName || accountName;

    // Reload to ensure we have the latest state
    await accountsPage.reload();

    // Verify the account is no longer in the list
    const exists = await accountsPage.verifyAccountIsListed(uniqueAccountName);
    if (exists) {
      throw new Error(
        `Account "${uniqueAccountName}" should not be in the accounts list but was found`
      );
    }
  }
);

Given('the account {string} has existing transactions', async function () {
  // This step would require creating transactions via API
  // For now, we'll store the info for the test to handle
  (this as { hasTransactions?: boolean }).hasTransactions = true;

  // In a real implementation, you would:
  // 1. Get the account ID
  // 2. Create transaction(s) via backend API
  // 3. Verify via the UI that transactions exist

  const uniqueAccountName = (this as { uniqueAccountName?: string })
    .uniqueAccountName;
  if (!uniqueAccountName) {
    throw new Error('No account name found in test context');
  }

  // Log that this account has transactions (would be validated by backend)
  console.log(`Account "${uniqueAccountName}" marked as having transactions`);
});
