import { AccountPort } from "../../../domain/ports/ui/create-account-ui.port";

export class SubmitAccountFormUseCase {
  constructor(private readonly accountPort: AccountPort) {}

  async execute(): Promise<void> {
    await this.accountPort.submitForm();
  }
}
