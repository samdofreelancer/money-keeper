// e2e/src/domains/account/application/use-cases/fill-account-form.use-case.ts

import { CreateAccountUiPort } from "../../domain/ports/ui/create-account-ui.port";
import { BaseUseCase } from "../../../../shared/application/BaseUseCase";

interface FillAccountFormInput {
  accountName?: string;
  accountType?: string;
  initialBalance?: number;
  currency?: string;
  description?: string;
  "Account Name"?: string;
  "Account Type"?: string;
  "Initial Balance"?: string;
  Currency?: string;
  Description?: string;
}

export class FillAccountFormUseCase extends BaseUseCase<
  FillAccountFormInput,
  void
> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(input: FillAccountFormInput): Promise<void> {
    const accountData = {
      accountName: input["Account Name"] || input.accountName || "",
      accountType: input["Account Type"] || input.accountType || "BANK_ACCOUNT",
      initialBalance: parseFloat(
        input["Initial Balance"] || input.initialBalance?.toString() || "0"
      ),
      currency: input["Currency"] || input.currency || "USD",
      description: input["Description"] || input.description,
    };

    await this.uiPort.fillAccountForm(accountData);
  }
}
