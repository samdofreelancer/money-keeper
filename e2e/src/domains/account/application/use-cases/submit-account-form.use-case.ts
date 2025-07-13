// e2e/src/domains/account/application/use-cases/submit-account-form.use-case.ts

import { CreateAccountUiPort } from "../../domain/ports/ui/create-account-ui.port";
import { BaseUseCase } from "../../../../shared/application/BaseUseCase";

export class SubmitAccountFormUseCase extends BaseUseCase<void, void> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(): Promise<void> {
    await this.uiPort.submitForm();
  }
}
