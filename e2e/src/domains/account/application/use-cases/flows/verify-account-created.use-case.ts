import { AccountPort } from "../../../domain/ports/ui/create-account-ui.port";

export class VerifyAccountCreatedUseCase {
  constructor(private readonly accountPort: AccountPort) {}

  async execute(): Promise<string | undefined> {
    const isCreated = await this.accountPort.verifyAccountCreationSuccess();
    if (!isCreated) throw new Error("Account creation verification failed");
    const accountId = await this.accountPort.getLastCreatedAccountId();
    return accountId === null ? undefined : accountId;
  }
}
