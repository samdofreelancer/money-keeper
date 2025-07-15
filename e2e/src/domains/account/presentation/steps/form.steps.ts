import { When, setDefaultTimeout } from "@cucumber/cucumber";

import { CustomWorld } from "../../../../support/world";
import { AccountFormValue } from "../../domain/value-objects/account-form-data.vo";

setDefaultTimeout(20000);

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

When("I try to submit with:", async function (this: CustomWorld, dataTable) {
  const formData = dataTable.rowsHash();
  this.currentFormData = formData;
  const trySubmitUseCase =
    this.getUseCasesOrThrow().createTrySubmitInvalidAccountFormUseCase();
  this.lastError = await trySubmitUseCase.execute(formData);
});

export {};
