import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { AccountUseCasesFactory } from "../../application/use-cases";
import { CustomWorld } from "../../../../support/world";

setDefaultTimeout(60000);

Given("I have access to the account management features", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const setupUseCase = useCasesFactory.createSetupAccountManagementUseCase();
  await setupUseCase.execute();
});

Given("I have an existing account named {string}", async function (this: CustomWorld, accountName: string) {
  if (!this.accountService) {
    throw new Error("Account service not initialized. Please ensure account management access was set up.");
  }
  const useCasesFactory = new AccountUseCasesFactory(this.accountService, this);
  const setupUseCase = useCasesFactory.createSetupExistingAccountUseCase();
  await setupUseCase.execute(accountName);
});

Given("I am on the create account form", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const navigateUseCase = useCasesFactory.createNavigateToCreateAccountFormUseCase();
  await navigateUseCase.execute();
});

When("I click the {string} button", async function (this: CustomWorld, buttonName: string) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const clickUseCase = useCasesFactory.createClickButtonUseCase();
  await clickUseCase.execute(buttonName);
});

When("I fill in the account form with:", async function (this: CustomWorld, dataTable) {
  const formData = dataTable.rowsHash();
  this.currentFormData = formData;
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const fillFormUseCase = useCasesFactory.createFillAccountFormUseCase();
  await fillFormUseCase.execute(formData);
});

When("I submit the form", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const submitUseCase = useCasesFactory.createSubmitAccountFormUseCase();
  await submitUseCase.execute();
});

Then("the account should be created successfully", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const verifyUseCase = useCasesFactory.createVerifyAccountCreatedUseCase();
  await verifyUseCase.execute();
});

Then("I should see the account in the accounts list", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const verifyListUseCase = useCasesFactory.createVerifyAccountInListUseCase();
  let accountName: string | undefined = undefined;
  if (this.currentFormData) {
    if (typeof this.currentFormData === "object") {
      if ("Account Name" in this.currentFormData) {
        accountName = this.currentFormData["Account Name"];
      } else if ("AccountName" in this.currentFormData) {
        accountName = this.currentFormData["AccountName"];
      }
    }
  }
  if (!accountName) {
    throw new Error("Account Name not found in currentFormData");
  }
  await verifyListUseCase.execute(accountName);
});

Then("the total balance should be updated", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const verifyBalanceUseCase = useCasesFactory.createVerifyTotalBalanceUpdatedUseCase();
  await verifyBalanceUseCase.execute();
});

When("I try to create another account with the same name {string}", async function (this: CustomWorld, accountName: string) {
  if (!this.accountService) {
    throw new Error("Account service not initialized. Please ensure account management access was set up.");
  }
  const useCasesFactory = new AccountUseCasesFactory(this.accountService, this);
  const tryCreateDuplicateUseCase = useCasesFactory.createTryCreateDuplicateAccountUseCase();
  this.lastError = await tryCreateDuplicateUseCase.execute(accountName);
});

Then("I should receive a conflict error", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const verifyErrorUseCase = useCasesFactory.createVerifyConflictErrorUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify conflict error");
  }
  await verifyErrorUseCase.execute(this.lastError);
});

Then("the account should not be created", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const verifyNotCreatedUseCase = useCasesFactory.createVerifyAccountNotCreatedUseCase();
  await verifyNotCreatedUseCase.execute();
});

When("I try to submit with:", async function (this: CustomWorld, dataTable) {
  const formData = dataTable.rowsHash();
  this.currentFormData = formData;
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const trySubmitUseCase = useCasesFactory.createTrySubmitInvalidAccountFormUseCase();
  this.lastError = await trySubmitUseCase.execute(formData);
});

Then("I should see validation errors", async function (this: CustomWorld) {
  const useCasesFactory = new AccountUseCasesFactory(undefined, this);
  const verifyValidationUseCase = useCasesFactory.createVerifyValidationErrorsUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify validation errors");
  }
  await verifyValidationUseCase.execute(this.lastError);
});

export {};
