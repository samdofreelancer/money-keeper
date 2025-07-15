import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";

import { AccountUseCasesFactory } from "../../application/use-cases";
import { CustomWorld } from "../../../../support/world";
import { AccountFormValue } from "../../domain/value-objects/account-form-data.vo";

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

When("I try to submit with:", async function (this: CustomWorld, dataTable) {
  const formData = dataTable.rowsHash();
  this.currentFormData = formData;
  const trySubmitUseCase =
    this.getUseCasesOrThrow().createTrySubmitInvalidAccountFormUseCase();
  this.lastError = await trySubmitUseCase.execute(formData);
});

Then("I should see validation errors", async function (this: CustomWorld) {
  const verifyValidationUseCase =
    this.getUseCasesOrThrow().createVerifyValidationErrorsUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify validation errors");
  }
  await verifyValidationUseCase.execute(this.lastError);
});

// Flow-based Steps (Business-oriented)

When(
  "I create a new bank account with the following details:",
  async function (this: CustomWorld, dataTable) {
    const formData = dataTable.rowsHash();

    // Use AccountFormValue class to normalize and validate form data
    const accountFormValue = AccountFormValue.fromRawInput(formData);

    const request = {
      accountName: accountFormValue.accountName,
      accountType: accountFormValue.accountType,
      initialBalance: accountFormValue.initialBalance,
      currency: accountFormValue.currency,
      description: accountFormValue.description,
    };

    const flowUseCase =
      this.getUseCasesOrThrow().createBankAccountFlowUseCase();
    const result = await flowUseCase.execute(request);

    switch (result.type) {
      case "success":
        // Track created account for automatic cleanup
        this.trackCreatedAccount(request.accountName, result.accountId);
        // Store the normalized and validated form data for later verification
        this.currentFormData = accountFormValue;
        break;
      case "validation_error":
      case "domain_error":
      case "conflict_error":
      case "unknown_error":
        throw new Error(
          `Failed to create bank account: ${result.error.message}`
        );
      default:
        throw new Error("Unexpected result type from create bank account flow");
    }
  }
);

When(
  "I try to create another account named {string}",
  async function (this: CustomWorld, accountName: string) {
    const flowUseCase =
      this.getUseCasesOrThrow().createBankAccountFlowUseCase();
    const result = await flowUseCase.executeForDuplicateTest(accountName);

    // Store the result for later verification (should be an error)
    switch (result.type) {
      case "conflict_error":
      case "validation_error":
      case "domain_error":
      case "unknown_error":
        this.lastError = new Error(result.error.message);
        break;
      case "success":
        // No error, do nothing
        break;
      default:
        this.lastError = new Error(
          "Unexpected result type from duplicate test"
        );
    }
  }
);

When(
  "I try to create a bank account with:",
  async function (this: CustomWorld, dataTable) {
    const formData = dataTable.rowsHash();

    const request = {
      accountName: formData["Account Name"] || "",
      accountType: formData["Account Type"] || "BANK_ACCOUNT",
      initialBalance: parseFloat(formData["Initial Balance"] || "0"),
      currency: formData["Currency"] || "USD",
      description: formData["Description"],
    };

    const flowUseCase =
      this.getUseCasesOrThrow().createBankAccountFlowUseCase();
    const result = await flowUseCase.executeWithValidation(request);

    // Store the result for later verification (expecting validation errors)
    switch (result.type) {
      case "validation_error":
      case "domain_error":
      case "conflict_error":
      case "unknown_error":
        this.lastError = new Error(result.error.message);
        break;
      case "success":
        // No error, do nothing
        break;
      default:
        this.lastError = new Error(
          "Unexpected result type from create with validation"
        );
    }
  }
);

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
