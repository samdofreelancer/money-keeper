// e2e/src/domains/account/application/use-cases/create-account.use-case.ts

import { CreateAccountUiPort } from '../../domain/ports/ui/create-account-ui.port';
import { BaseUseCase } from '../../../../shared/application/BaseUseCase';

interface CreateAccountInput {
  accountName: string;
  initialBalance: number;
  accountType?: string;
  currency?: string;
  description?: string;
}

export class CreateAccountUseCase extends BaseUseCase<CreateAccountInput, void> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(input: CreateAccountInput): Promise<void> {
    const {
      accountName,
      initialBalance,
      accountType = 'BANK_ACCOUNT',
      currency = 'USD',
      description = 'Primary checking',
    } = input;

    await this.uiPort.navigateToApp();
    await this.uiPort.fillAccountForm({
      accountName,
      accountType,
      initialBalance,
      currency,
      description,
    });
    await this.uiPort.submitForm();
  }

  async verifyAccountListed(accountName: string, balance: string) {
    return this.uiPort.isAccountListed(accountName, balance);
  }
}
