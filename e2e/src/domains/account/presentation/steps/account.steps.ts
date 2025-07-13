import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";

import { AccountUseCasesFactory } from "../../application/use-cases";
import { CustomWorld } from "../../../../support/world";
import { logger } from "../../../../shared/utils/logger";

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

Given("I am on the create account form", async function (this: CustomWorld) {
  const navigateUseCase =
    this.getUseCasesOrThrow().createNavigateToCreateAccountFormUseCase();
  await navigateUseCase.execute();
});

When(
  "I click the {string} button",
  async function (this: CustomWorld, buttonName: string) {
    const clickUseCase = this.getUseCasesOrThrow().createClickButtonUseCase();
    await clickUseCase.execute({ buttonName });
  }
);

When(
  "I fill in the account form with:",
  async function (this: CustomWorld, dataTable) {
    const formData = dataTable.rowsHash();

    // Generate unique account name to avoid duplicates
    const timestamp = Date.now();
    const uniqueAccountName = `${formData["Account Name"]}_${timestamp}`;
    formData["Account Name"] = uniqueAccountName;

    // Track for cleanup
    if (!this.createdAccountNames) {
      this.createdAccountNames = [];
    }
    this.createdAccountNames.push(uniqueAccountName);

    this.currentFormData = formData;
    const fillFormUseCase =
      this.getUseCasesOrThrow().createFillAccountFormUseCase();
    await fillFormUseCase.execute(formData);
  }
);

When("I submit the form", async function (this: CustomWorld) {
  const submitUseCase =
    this.getUseCasesOrThrow().createSubmitAccountFormUseCase();
  await submitUseCase.execute();
});

Then(
  "the account should be created successfully",
  async function (this: CustomWorld) {
    const verifyUseCase =
      this.getUseCasesOrThrow().createVerifyAccountCreatedUseCase();
    await verifyUseCase.execute();

    // Capture the account ID for cleanup
    if (this.accountUiPort) {
      const accountId = await this.accountUiPort.getLastCreatedAccountId();
      if (accountId) {
        if (!this.createdAccountIds) {
          this.createdAccountIds = [];
        }
        this.createdAccountIds.push(accountId);
        logger.info(`Tracked account ID for cleanup: ${accountId}`);
      }
    }
  }
);

Then(
  "I should see the account in the accounts list",
  async function (this: CustomWorld) {
    const verifyListUseCase =
      this.getUseCasesOrThrow().createVerifyAccountInListUseCase();
    let accountName: string | undefined = undefined;
    if (this.currentFormData) {
      if (typeof this.currentFormData === "object") {
        if ("Account Name" in this.currentFormData) {
          accountName = this.currentFormData["Account Name"] as string;
        } else if ("AccountName" in this.currentFormData) {
          accountName = this.currentFormData["AccountName"] as string;
        }
      }
    }
    if (!accountName) {
      throw new Error("Account Name not found in currentFormData");
    }
    await verifyListUseCase.execute({ accountName });
  }
);

Then("the total balance should be updated", async function (this: CustomWorld) {
  const verifyBalanceUseCase =
    this.getUseCasesOrThrow().createVerifyTotalBalanceUpdatedUseCase();
  await verifyBalanceUseCase.execute();
});

When(
  "I try to create another account with the same name {string}",
  async function (this: CustomWorld, accountName: string) {
    //Open form create account
    const clickUseCase = this.getUseCasesOrThrow().createClickButtonUseCase();
    await clickUseCase.execute({ buttonName: "Add Account" });

    const tryCreateDuplicateUseCase =
      this.getUseCasesOrThrow().createTryCreateDuplicateAccountUseCase();
    this.lastError = await tryCreateDuplicateUseCase.execute(accountName);
  }
);

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

    const request = {
      accountName: formData["Account Name"],
      accountType: formData["Account Type"] || "Bank Account",
      initialBalance: parseFloat(formData["Initial Balance"]),
      currency: formData["Currency"],
      description: formData["Description"],
    };

    // Track for cleanup
    if (!this.createdAccountNames) {
      this.createdAccountNames = [];
    }
    this.createdAccountNames.push(request.accountName);

    const flowUseCase =
      this.getUseCasesOrThrow().createBankAccountFlowUseCase();
    const result = await flowUseCase.execute(request);

    if (!result.success) {
      throw new Error(`Failed to create bank account: ${result.errorMessage}`);
    }

    // Track account ID for cleanup
    if (result.accountId) {
      if (!this.createdAccountIds) {
        this.createdAccountIds = [];
      }
      this.createdAccountIds.push(result.accountId);
      logger.info(`Tracked account ID for cleanup: ${result.accountId}`);
    }

    // Store the created account data for later verification
    this.currentFormData = formData;
  }
);

When(
  "I try to create another account named {string}",
  async function (this: CustomWorld, accountName: string) {
    const flowUseCase =
      this.getUseCasesOrThrow().createBankAccountFlowUseCase();
    const result = await flowUseCase.executeForDuplicateTest(accountName);

    // Store the result for later verification (should be an error)
    if (!result.success && result.errorMessage) {
      this.lastError = new Error(result.errorMessage);
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
    if (!result.success && result.errorMessage) {
      this.lastError = new Error(result.errorMessage);
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
  "the total balance should include {string}",
  async function (this: CustomWorld, _expectedBalance: string) {
    const verifyBalanceUseCase =
      this.getUseCasesOrThrow().createVerifyTotalBalanceUpdatedUseCase();
    await verifyBalanceUseCase.execute();

    // TODO: Additional verification that the balance includes the expected amount
    // This could be enhanced to check the actual balance value against _expectedBalance
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
