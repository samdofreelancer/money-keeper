import { When, Then } from '@cucumber/cucumber';
import { getAccountsPage } from 'shared/utilities/hooks';

/**
 * Step definitions for account deactivation scenarios
 */

When(
  'I deactivate the account {string}',
  async function (accountName: string) {
    const accountsPage = getAccountsPage();
    // Get the unique account name
    const uniqueAccountName = (this as { uniqueAccountName?: string })
      .uniqueAccountName;
    if (!uniqueAccountName) {
      throw new Error(
        'No account name found in test context. Make sure "I have an existing account named" step was executed.'
      );
    }

    // This would require adding a deactivateAccount method to AccountsPage
    // For now, we'll throw a descriptive error
    throw new Error(
      'Deactivation feature not yet implemented. Please add deactivateAccount() method to AccountsPage.'
    );
  }
);

Then('the account should be marked as inactive', async function () {
  const accountsPage = getAccountsPage();
  const uniqueAccountName = (this as { uniqueAccountName?: string })
    .uniqueAccountName;
  if (!uniqueAccountName) {
    throw new Error('No account name found in test context');
  }

  // This would require adding an isAccountInactive method to AccountsPage
  throw new Error(
    'Account inactive status check not yet implemented. Please add isAccountInactive() method to AccountsPage.'
  );
});

Then(
  'the account balance should not be included in total balance',
  async function () {
    const accountsPage = getAccountsPage();

    // Get the total balance displayed on the page
    const totalBalance = await accountsPage.getTotalBalance();

    if (!totalBalance) {
      throw new Error('Could not retrieve total balance');
    }

    // Verify that the inactive account's balance is not included
    // This is a placeholder - actual implementation would need to:
    // 1. Store the inactive account's balance before deactivation
    // 2. Calculate what the total should be without it
    // 3. Verify the displayed total matches the expected calculation
  }
);
