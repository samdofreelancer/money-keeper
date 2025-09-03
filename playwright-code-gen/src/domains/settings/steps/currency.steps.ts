import { When } from '@cucumber/cucumber';
import { getAccountsPage } from 'shared/utilities/hooks';
import { getWorldSettingsUseCase } from './helpers';

When(
  'I set default currency to {string} in settings',
  async function (code: string) {
    const settingsUseCase = getWorldSettingsUseCase();
    await settingsUseCase.setDefaultCurrency(code);
    // Return to Accounts page for subsequent steps
    const accountsPage = getAccountsPage();
    await accountsPage.navigateToAccountsPage();
  }
);
