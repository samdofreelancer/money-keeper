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
    await this.page.waitForSelector(
      `.el-select-dropdown__item:has-text("${type}")`,
      { state: 'visible', timeout: 3000 }
    );
    await this.page.click(`.el-select-dropdown__item:has-text("${type}")`);
  }

  async selectCurrencyByName(name: string) {
    await this.page.click(this.selectors.inputs.currencySelect);
    await this.page.waitForSelector(
      `.el-select-dropdown__item:has-text("${name}")`,
      { state: 'visible', timeout: 3000 }
    );
    await this.page.click(`.el-select-dropdown__item:has-text("${name}")`);
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
