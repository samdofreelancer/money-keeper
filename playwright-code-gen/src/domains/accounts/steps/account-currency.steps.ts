import { Then } from '@cucumber/cucumber';
import { getAccountsPage } from 'shared/utilities/hooks';

Then(
  'I should see the success message {string}',
  async function (message: string) {
    const accountsPage = getAccountsPage();
    // Check for any success message, then verify its text
    const visible = await accountsPage.isSuccessMessageVisible();
    if (!visible) {
      throw new Error(`Success message not visible`);
    }
    // Optionally, get the actual message text and compare
    const actualMessage = await accountsPage.getSuccessMessageText?.();
    if (actualMessage && actualMessage.trim() !== message) {
      throw new Error(
        `Expected success message "${message}", but got "${actualMessage.trim()}"`
      );
    }
  }
);

Then(
  'the account {string} should appear in my accounts list with balance {string}',
  async function (accountName: string, balance: string) {
    const accountsPage = getAccountsPage();
    const isListed = await accountsPage.verifyAccountIsListed(accountName);
    if (!isListed) {
      throw new Error(
        `Account "${accountName}" not found in the accounts list`
      );
    }
    const actualBalance =
      await accountsPage.getAccountBalanceForRow(accountName);
    if (!actualBalance || actualBalance.trim() !== balance) {
      throw new Error(
        `Expected balance "${balance}", but got "${actualBalance?.trim()}"`
      );
    }
  }
);

Then(
  'the total balance should be shown in default currency from settings',
  async function () {
    const accountsPage = getAccountsPage();
    const totalBalance = await accountsPage.getTotalBalance();
    // Expect it contains a currency symbol of currently selected currency code
    // For VND, symbol is ₫; for USD, $; for EUR, €
    const symbols = ['₫', '$', '€'];
    if (!symbols.some(s => totalBalance.includes(s))) {
      throw new Error(
        `Expected total balance to include the default currency symbol, but got "${totalBalance}"`
      );
    }
  }
);
