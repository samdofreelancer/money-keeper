import { AccountsPlaywrightPage } from 'account-domains/pages/accounts.playwright.page';
import { Inject, Transient, TOKENS } from 'shared/di';
import { Logger } from 'shared/utilities/logger';

/**
 * Use case for account sorting verification via UI
 */
@Transient({ token: TOKENS.AccountSortingVerificationUiUseCase })
export class AccountSortingVerificationUiUseCase {
  constructor(
    @Inject(TOKENS.AccountsPlaywrightPage)
    private accountsPage: AccountsPlaywrightPage
  ) {}

  /**
   * Verify that accounts are sorted by balance in the specified order
   */
  async verifyAccountsSortedByBalance(
    balances: number[],
    order: 'asc' | 'desc'
  ): Promise<void> {
    const sortedBalances = [...balances].sort((a, b) =>
      order === 'asc' ? a - b : b - a
    );

    for (let i = 0; i < balances.length; i++) {
      if (balances[i] !== sortedBalances[i]) {
        throw new Error(
          `Accounts are not sorted by balance in ${order}ending order. Expected ${JSON.stringify(
            sortedBalances
          )} but got ${JSON.stringify(balances)}.`
        );
      }
    }

    Logger.info(
      `✓ Verified accounts are sorted by balance in ${order}ending order`
    );
  }
}
