import { Inject, Transient, TOKENS } from 'shared/di';
import { SettingsPlaywrightPage } from 'settings-domain/pages/settings.playwright.page';

@Transient({ token: TOKENS.SettingsUiUseCase })
export class SettingsUiUseCase {
  constructor(
    @Inject(TOKENS.SettingsPlaywrightPage)
    private settingsPage: SettingsPlaywrightPage
  ) {}

  async setDefaultCurrency(code: string) {
    await this.settingsPage.setDefaultCurrency(code);
  }
}
