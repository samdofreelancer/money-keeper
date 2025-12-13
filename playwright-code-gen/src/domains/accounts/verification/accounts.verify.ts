import { expect, Page } from '@playwright/test';
import { AccountsPlaywrightPage } from '../pages/accounts.playwright.page';
import { AccountsVerification as AccountsPageVerification } from '../pages/accounts-verification.page';
import { TOKENS } from 'shared/di/tokens';
import { Inject, Transient } from 'shared/di/decorators';

/**
 * Verification class for Accounts domain.
 *
 * Provides both the new "verifyXxx" methods (which contain asserts) and the
 * legacy page-style boolean methods expected by the page object. The class is
 * registered in DI under the AccountsVerification token to preserve existing
 * world/container usage.
 */
@Transient({ token: TOKENS.AccountsVerification })
export class AccountsVerify {
  private pageAdapter?: AccountsPageVerification;

  // If DI injects an AccountsPlaywrightPage, we'll use it. Otherwise the page
  // object constructs this class directly with a Playwright Page, so accept
  // either shape to remain compatible.
  constructor(
    @Inject(TOKENS.AccountsPlaywrightPage)
    private readonly accountsPageOrPage?: AccountsPlaywrightPage | Page
  ) {
    // If we received a raw Playwright Page (has locator), create the old
    // page-level adapter so legacy boolean methods still work.
    try {
      // detect Playwright Page by presence of 'locator' method
      if (
        this.accountsPageOrPage &&
        typeof (this.accountsPageOrPage as Page).locator === 'function'
      ) {
        this.pageAdapter = new AccountsPageVerification(
          this.accountsPageOrPage as Page
        );
      }
    } catch {
      // ignore; fall back to DI-injected accounts page usage
    }
  }

  // --- New assert-style verifications ---
  async verifySuccessMessageVisible(): Promise<void> {
    if (this.pageAdapter) {
      expect(await this.pageAdapter.isSuccessMessageVisible()).toBe(true);
    } else {
      expect(
        await (
          this.accountsPageOrPage as AccountsPlaywrightPage
        ).isSuccessMessageVisible()
      ).toBe(true);
    }
  }

  async verifyErrorMessageVisible(errorMessage: string): Promise<void> {
    if (this.pageAdapter) {
      expect(await this.pageAdapter.isErrorMessageVisible(errorMessage)).toBe(
        true
      );
    } else {
      expect(
        await (
          this.accountsPageOrPage as AccountsPlaywrightPage
        ).isErrorMessageVisible(errorMessage)
      ).toBe(true);
    }
  }

  async verifySuccessMessageText(expectedMessage: string): Promise<void> {
    // Success text is provided by the data retrieval layer on AccountsPlaywrightPage
    expect(
      await (
        this.accountsPageOrPage as AccountsPlaywrightPage
      ).getSuccessMessageText()
    ).toBe(expectedMessage);
  }

  async verifyAccountBalance(
    accountName: string,
    expectedBalance: string
  ): Promise<void> {
    const actualBalance = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getAccountBalanceForRow(accountName);
    expect(actualBalance).toBe(expectedBalance);
  }

  async verifyAccountListed(accountName: string): Promise<void> {
    const exists = this.pageAdapter
      ? await this.pageAdapter.verifyAccountIsListed(accountName)
      : await (
          this.accountsPageOrPage as AccountsPlaywrightPage
        ).verifyAccountIsListed(accountName);
    expect(exists).toBe(true);
  }

  async verifyAccountNotListed(accountName: string): Promise<void> {
    const exists = this.pageAdapter
      ? await this.pageAdapter.verifyAccountIsListed(accountName)
      : await (
          this.accountsPageOrPage as AccountsPlaywrightPage
        ).verifyAccountIsListed(accountName);
    expect(exists).toBe(false);
  }

  async verifySearchResultsContain(expectedAccountName: string): Promise<void> {
    const visibleNames = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getVisibleAccountNames();
    for (const name of visibleNames) {
      expect(name).toContain(expectedAccountName);
    }
  }

  async verifyAccountsSortedByBalance(
    order: 'ascending' | 'descending'
  ): Promise<void> {
    const balances = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getAccountBalances();
    const sortedBalances = [...balances].sort((a, b) =>
      order === 'ascending' ? a - b : b - a
    );
    for (let i = 0; i < balances.length; i++) {
      expect(balances[i]).toBe(sortedBalances[i]);
    }
  }

  async verifyAccountCount(
    accountName: string,
    expectedCount: number
  ): Promise<void> {
    const count = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getAccountCount(accountName);
    expect(count).toBe(expectedCount);
  }

  async verifyAccountNotCreated(): Promise<void> {
    const accountCount = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getTotalAccountCount();
    if (accountCount > 0) {
      throw new Error('An account was created when it should not have been');
    }
  }

  async verifyBalanceInCurrency(currency: string): Promise<void> {
    const balanceText = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getTotalBalance();
    if (!balanceText.includes(currency)) {
      throw new Error(`Balance does not display in ${currency}`);
    }
  }

  async verifyAccountDescription(
    accountName: string,
    expectedDescription: string
  ): Promise<void> {
    const description = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getAccountDescription(accountName);
    if (description !== expectedDescription) {
      throw new Error(
        `Expected description "${expectedDescription}", but found "${description}"`
      );
    }
  }

  async verifyTotalBalanceHasCurrency(): Promise<void> {
    const totalBalance = await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).getTotalBalance();
    const symbols = ['₫', '$', '€'];
    expect(symbols.some(s => totalBalance.includes(s))).toBe(true);
  }

  // --- Legacy boolean / page-style methods kept for compatibility ---
  async verifyAccountIsListed(name: string): Promise<boolean> {
    if (this.pageAdapter)
      return await this.pageAdapter.verifyAccountIsListed(name);
    return await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).verifyAccountIsListed(name);
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    if (this.pageAdapter)
      return await this.pageAdapter.isSuccessMessageVisible();
    return await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).isSuccessMessageVisible();
  }

  async isErrorMessageVisible(errorMessage: string): Promise<boolean> {
    if (this.pageAdapter)
      return await this.pageAdapter.isErrorMessageVisible(errorMessage);
    return await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).isErrorMessageVisible(errorMessage);
  }

  async verifyOnAccountsPage(): Promise<void> {
    if (this.pageAdapter) return await this.pageAdapter.verifyOnAccountsPage();
    return await (
      this.accountsPageOrPage as AccountsPlaywrightPage
    ).verifyOnAccountsPage();
  }
}

// Backwards-compatible export: some files expect a named export AccountsVerification
export class AccountsVerification extends AccountsVerify {}
