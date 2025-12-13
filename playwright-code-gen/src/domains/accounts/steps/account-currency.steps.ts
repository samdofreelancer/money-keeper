import { Then } from '@cucumber/cucumber';

Then(
  'the account {string} should appear in my accounts list with balance {string}',
  async function (accountName: string, balance: string) {
    await this.accountsVerification.verifyAccountListed(accountName);
    await this.accountsVerification.verifyAccountBalance(accountName, balance);
  }
);

Then(
  'the total balance should be shown in default currency from settings',
  async function () {
    await this.accountsVerification.verifyTotalBalanceHasCurrency();
  }
);
