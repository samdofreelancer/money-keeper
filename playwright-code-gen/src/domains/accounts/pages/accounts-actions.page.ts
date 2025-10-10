import { Page, Locator } from '@playwright/test';
import { Logger } from 'shared/utilities/logger';
import { selectors } from './accounts-selectors';
import { IAccountsActions } from './accounts-interfaces';
import { AccountFormComponent } from './components/account-form.component';

export class AccountsActions implements IAccountsActions {
  private readonly page: Page;
  public readonly accountForm: AccountFormComponent;

  constructor(page: Page, accountForm: AccountFormComponent) {
    this.page = page;
    this.accountForm = accountForm;
  }

  private get addAccountButton(): Locator {
    return this.page.locator(selectors.buttons.addAccount);
  }

  private get confirmButton(): Locator {
    return this.page.locator(selectors.buttons.confirm);
  }

  private get dialog(): Locator {
    return this.page.locator(selectors.dialog);
  }

  private deleteButtonForAccount(accountName: string): Locator {
    return this.page.locator(
      `text=${accountName} >> ${selectors.accountElements.deleteButton}`
    );
  }

  private editButtonForAccount(accountName: string): Locator {
    return this.page
      .locator(`tr:has(td:has-text("${accountName}"))`)
      .getByTestId('edit-account-button');
  }

  private get balanceColumnHeader(): Locator {
    return this.page.locator(selectors.buttons.balanceColumnHeader);
  }

  private get searchInput(): Locator {
    return this.page.locator(selectors.search.searchInput);
  }

  async clickBalanceColumnHeader() {
    await this.balanceColumnHeader.click();
  }

  async clickAddAccountButton() {
    await this.addAccountButton.click();
    await this.dialog.waitFor({ state: 'visible' });
  }

  async deleteAccount(accountName: string): Promise<void> {
    try {
      Logger.info(`Attempting to delete account: ${accountName}`);
      await this.deleteButtonForAccount(accountName).click();
      await this.confirmButton.click();
      Logger.info(
        `Successfully initiated deletion for account: ${accountName}`
      );
    } catch (error) {
      Logger.error(`Failed to delete account: ${accountName}`, error as Error);
      throw new Error(
        `Failed to delete account ${accountName}: ${(error as Error).message}`
      );
    }
  }

  async clickEditAccount(accountName: string): Promise<void> {
    try {
      Logger.info(`Attempting to edit account: ${accountName}`);
      await this.editButtonForAccount(accountName).click();
      await this.dialog.waitFor({ state: 'visible' });
      Logger.info(
        `Successfully opened edit dialog for account: ${accountName}`
      );
    } catch (error) {
      Logger.error(`Failed to edit account: ${accountName}`, error as Error);
      throw new Error(
        `Failed to edit account ${accountName}: ${(error as Error).message}`
      );
    }
  }

  async searchAccounts(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
  }

  async reload() {
    await this.page.reload();
  }
}
