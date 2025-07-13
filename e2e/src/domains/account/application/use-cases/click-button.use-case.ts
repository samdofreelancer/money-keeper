// e2e/src/domains/account/application/use-cases/click-button.use-case.ts

import { CreateAccountUiPort } from "../../domain/ports/ui/create-account-ui.port";
import { BaseUseCase } from "../../../../shared/application/BaseUseCase";

interface ClickButtonInput {
  buttonName: string;
}

export class ClickButtonUseCase extends BaseUseCase<ClickButtonInput, void> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(input: ClickButtonInput): Promise<void> {
    await this.uiPort.clickButton(input.buttonName);
  }
}
