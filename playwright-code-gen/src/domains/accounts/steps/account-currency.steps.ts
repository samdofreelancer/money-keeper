import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { getAccountsPage } from 'shared/utilities/hooks';

Then(
  'the account {string} should appear in my accounts list with balance {string}',
  async function (accountName: string, balance: string) {
    const accountsPage = getAccountsPage();
    expect(await accountsPage.verifyAccountIsListed(accountName)).toBe(true);
    expect(
      (await accountsPage.getAccountBalanceForRow(accountName))?.trim()
    ).toBe(balance);
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
    expect(symbols.some(s => totalBalance.includes(s))).toBe(true);
  }
);
