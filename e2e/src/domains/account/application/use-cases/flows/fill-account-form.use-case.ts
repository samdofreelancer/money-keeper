import { AccountPort } from "../../../domain/ports/ui/create-account-ui.port";
import { CreateBankAccountRequest } from "./shared/types/CreateBankAccountTypes";

export class FillAccountFormUseCase {
  constructor(private readonly accountPort: AccountPort) {}

  async execute(request: CreateBankAccountRequest): Promise<void> {
    const formData = {
      accountName: request.accountName,
      accountType: request.accountType,
      initialBalance: request.initialBalance,
      currency: request.currency,
      description: request.description,
    };
    await this.accountPort.fillAccountForm(formData);
  }
}
