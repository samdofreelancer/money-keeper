import { Then, setDefaultTimeout } from "@cucumber/cucumber";

import { CustomWorld } from "../../../../support/world";

setDefaultTimeout(20000);

Then("the total balance should be updated", async function (this: CustomWorld) {
  const verifyBalanceUseCase =
    this.getUseCasesOrThrow().createVerifyTotalBalanceUpdatedUseCase();
  await verifyBalanceUseCase.execute();
});

Then("I should receive a conflict error", async function (this: CustomWorld) {
  const verifyErrorUseCase =
    this.getUseCasesOrThrow().createVerifyConflictErrorUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify conflict error");
  }
  await verifyErrorUseCase.execute(this.lastError);
});

Then("the account should not be created", async function (this: CustomWorld) {
  const verifyNotCreatedUseCase =
    this.getUseCasesOrThrow().createVerifyAccountNotCreatedUseCase();
  await verifyNotCreatedUseCase.execute();
});

Then("I should see validation errors", async function (this: CustomWorld) {
  const verifyValidationUseCase =
    this.getUseCasesOrThrow().createVerifyValidationErrorsUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify validation errors");
  }
  await verifyValidationUseCase.execute(this.lastError);
});

Then(
  "I should see the account {string} in my list",
  async function (this: CustomWorld, accountName: string) {
    const verifyListUseCase =
      this.getUseCasesOrThrow().createVerifyAccountInListUseCase();
    await verifyListUseCase.execute({ accountName });
  }
);

Then(
  "the total balance should be at least {string}",
  async function (this: CustomWorld, minimumBalance: string) {
    const verifyBalanceUseCase =
      this.getUseCasesOrThrow().createVerifyTotalBalanceUpdatedUseCase();
    await verifyBalanceUseCase.execute({ expectedAmount: minimumBalance });
  }
);

Then(
  "I should see an error about duplicate account name",
  async function (this: CustomWorld) {
    const verifyErrorUseCase =
      this.getUseCasesOrThrow().createVerifyConflictErrorUseCase();
    if (!this.lastError) {
      throw new Error("No error found to verify conflict error");
    }
    await verifyErrorUseCase.execute(this.lastError);
  }
);

export {};
