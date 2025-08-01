import { Given, setDefaultTimeout } from "@cucumber/cucumber";

import { AccountUseCasesFactory } from "../../application/use-cases";
import { CustomWorld } from "../../../../support/world";

setDefaultTimeout(20000);

Given(
  "I have access to the account management features",
  async function (this: CustomWorld) {
    const useCasesFactory = new AccountUseCasesFactory(undefined, this);
    const setupUseCase = useCasesFactory.createSetupAccountManagementUseCase();
    await setupUseCase.execute();
  }
);

Given(
  "I have an existing account named {string}",
  async function (this: CustomWorld, accountName: string) {
    const setupUseCase =
      this.getUseCasesOrThrow().createSetupExistingAccountUseCase();
    await setupUseCase.execute(accountName);
  }
);

export {};
