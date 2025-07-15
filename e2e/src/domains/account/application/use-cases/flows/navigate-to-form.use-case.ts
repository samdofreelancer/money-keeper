import { AccountPort } from '../../../domain/ports/ui/create-account-ui.port';

export class NavigateToFormUseCase {
  constructor(private readonly accountPort: AccountPort) {}

  async execute(): Promise<void> {
    await this.accountPort.navigateToApp();
    await this.accountPort.clickButton('Add Account');
  }
}
