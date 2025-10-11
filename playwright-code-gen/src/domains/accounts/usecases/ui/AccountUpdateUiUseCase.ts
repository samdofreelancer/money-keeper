import { AccountsPlaywrightPage } from '@/domains/accounts/pages/accounts.playwright.page';
import { Logger } from 'shared/utilities/logger';
import { AccountDto } from '@/domains/accounts/types/account.dto';
import { Inject, Transient, TOKENS } from 'shared/di';

/**
 * Use case for account update via UI interactions
 */
@Transient({ token: TOKENS.AccountUpdateUiUseCase })
export class AccountUpdateUiUseCase {
  constructor(
    @Inject(TOKENS.AccountsPlaywrightPage)
    private accountsPage: AccountsPlaywrightPage
  ) {}

  /**
   * Update an existing account by clicking edit, filling form and submitting
   * @returns true if update was successful (API response 200), false otherwise
   */
  async updateAccount(oldName: string, accountData: AccountDto): Promise<boolean> {
    Logger.info(
      `Starting account update for "${oldName}" to "${accountData.name}"`
    );
    await this.clickEditAccount(oldName);
    Logger.info(`Edit dialog opened for "${oldName}"`);

    // Set up response interception for the update API call
    const responsePromise = this.accountsPage.waitForAccountUpdateResponse();

    await this.accountsPage.accountForm.fillAccountForm(accountData);
    Logger.info(`Form filled with new data for "${accountData.name}"`);

    try {
      const [ , response ] = await Promise.all([
        this.clickUpdateButton(),
        responsePromise
      ]);
      Logger.info(`Update button clicked for "${accountData.name}"`);

      const isSuccess = response.ok();
      if (isSuccess) {
        Logger.info(`Update successful for "${accountData.name}" - API response 200`);
      } else {
        Logger.warn(`Update failed for "${accountData.name}" - API response ${response.status()}`);
      }
      return isSuccess;
    } catch (error) {
      Logger.error(`Failed to intercept API response for update of "${accountData.name}"`, error);
      return false;
    }
  }

  /**
   * Click the edit button for a specific account
   */
  async clickEditAccount(accountName: string) {
    await this.accountsPage.clickEditAccount(accountName);
  }

  /**
   * Click the Update button
   */
  async clickUpdateButton() {
    await this.accountsPage.accountForm.clickUpdateButton();
  }

  /**
   * Verify that an account was updated successfully
   */
  async verifyAccountUpdated(name: string) {
    const exists = await this.accountsPage.verifyAccountIsListed(name);
    if (!exists) {
      throw new Error(`Account ${name} was not found in the accounts list`);
    }
  }

  /**
   * Reload the accounts page to refresh the account list
   */
  async reloadAccountsPage() {
    Logger.info('Reloading accounts page to refresh account list');
    await this.accountsPage.reload();
  }
}
