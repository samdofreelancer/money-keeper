import { Page } from '@playwright/test';
import { AccountDto } from 'account-domains/types/account.dto';
import { Inject, Transient, TOKENS } from 'shared/di';

@Transient({ token: TOKENS.AccountFormComponent })
export class AccountFormComponent {
  constructor(@Inject(TOKENS.Page) private page: Page) {}

  private selectors = {
    buttons: {
      create: 'button:has-text("Create")',
      update: 'button:has-text("Update")',
    },
    inputs: {
      accountName: 'input[placeholder="Enter account name"]',
      accountType: '[data-testid="select-account-type"] .el-select__wrapper',
      balance: 'input[type="number"]',
      description: 'input[placeholder="Enter description (optional)"]',
      currencySelect: '[data-testid="form-item-currency"] .el-select__wrapper',
    },
    dialog: '.el-dialog',
  };

  async fillAccountName(name: string) {
    await this.page.fill(this.selectors.inputs.accountName, name);
  }

  async selectAccountType(type: string) {
    await this.page.click(this.selectors.inputs.accountType);
    // Wait for dropdown to appear
    await this.page.waitForSelector(
      '[data-testid="option-account-type"]',
      { state: 'visible', timeout: 3000 }
    );
    // Find and click the option that matches the label text
    const options = await this.page.$$('[data-testid="option-account-type"]');
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.includes(type)) {
        await option.click();
        return;
      }
    }
    throw new Error(`Account type "${type}" not found in dropdown options`);
  }

  async selectCurrencyByName(name: string) {
    await this.page.click(this.selectors.inputs.currencySelect);
    // Currency selector might have different data-testid, so use a more general approach
    // Wait for the dropdown and find the item with matching text
    await this.page.waitForSelector(
      '.el-select-dropdown__item',
      { state: 'visible', timeout: 3000 }
    );
    // Get all dropdown items and find the one with matching text
    const items = await this.page.$$('.el-select-dropdown__item');
    for (const item of items) {
      const text = await item.textContent();
      if (text && text.includes(name)) {
        await item.click();
        return;
      }
    }
    throw new Error(`Currency "${name}" not found in dropdown options`);
  }

  async fillBalance(balance: number) {
    await this.page.fill(this.selectors.inputs.balance, balance.toString());
  }

  async fillDescription(description: string) {
    await this.page.fill(this.selectors.inputs.description, description || '');
  }

  async fillAccountForm(accountData: AccountDto) {
    await this.fillAccountName(accountData.name);
    await this.selectAccountType(accountData.type);
    await this.fillBalance(accountData.balance);
    if (accountData.currency) {
      await this.selectCurrencyByName(accountData.currency);
    }
    if (accountData.description) {
      await this.fillDescription(accountData.description);
    }
  }

  async clickCreateButton() {
    await this.page.click(this.selectors.buttons.create);
  }

  async clickUpdateButton() {
    await this.page.getByTestId('button-submit').click();
  }
}
