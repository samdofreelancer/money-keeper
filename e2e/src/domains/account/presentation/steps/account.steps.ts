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
    if (!this.useCases) {
      throw new Error(
        "Use cases not initialized. Please ensure account management access was set up."
      );
    }
    const setupUseCase = this.useCases.createSetupExistingAccountUseCase();
    await setupUseCase.execute(accountName);
  }
);

Given("I am on the create account form", async function (this: CustomWorld) {
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const navigateUseCase = this.useCases.createNavigateToCreateAccountFormUseCase();
  await navigateUseCase.execute();
});

When(
  "I click the {string} button",
  async function (this: CustomWorld, buttonName: string) {
    if (!this.useCases) {
      throw new Error("Use cases not initialized. Please ensure account management access was set up.");
    }
    const clickUseCase = this.useCases.createClickButtonUseCase();
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
    if (!this.useCases) {
      throw new Error("Use cases not initialized. Please ensure account management access was set up.");
    }
    const fillFormUseCase = this.useCases.createFillAccountFormUseCase();
    await fillFormUseCase.execute(formData);
  }
);

When("I submit the form", async function (this: CustomWorld) {
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const submitUseCase = this.useCases.createSubmitAccountFormUseCase();
  await submitUseCase.execute();
});

Then(
  "the account should be created successfully",
  async function (this: CustomWorld) {
    if (!this.useCases) {
      throw new Error("Use cases not initialized. Please ensure account management access was set up.");
    }
    const verifyUseCase = this.useCases.createVerifyAccountCreatedUseCase();
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
    if (!this.useCases) {
      throw new Error("Use cases not initialized. Please ensure account management access was set up.");
    }
    const verifyListUseCase =
      this.useCases.createVerifyAccountInListUseCase();
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
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const verifyBalanceUseCase =
    this.useCases.createVerifyTotalBalanceUpdatedUseCase();
  await verifyBalanceUseCase.execute();
});

When(
  "I try to create another account with the same name {string}",
  async function (this: CustomWorld, accountName: string) {

    if (!this.useCases) {
      throw new Error("Use cases not initialized. Please ensure account management access was set up.");
    }

    //Open form create account
    const clickUseCase = this.useCases.createClickButtonUseCase();
    await clickUseCase.execute({ buttonName: "Add Account" });

    const tryCreateDuplicateUseCase =
      this.useCases.createTryCreateDuplicateAccountUseCase();
    this.lastError = await tryCreateDuplicateUseCase.execute(accountName);
  }
);

Then("I should receive a conflict error", async function (this: CustomWorld) {
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const verifyErrorUseCase = this.useCases.createVerifyConflictErrorUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify conflict error");
  }
  await verifyErrorUseCase.execute(this.lastError);
});

Then("the account should not be created", async function (this: CustomWorld) {
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const verifyNotCreatedUseCase =
    this.useCases.createVerifyAccountNotCreatedUseCase();
  await verifyNotCreatedUseCase.execute();
});

When("I try to submit with:", async function (this: CustomWorld, dataTable) {
  const formData = dataTable.rowsHash();
  this.currentFormData = formData;
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const trySubmitUseCase =
    this.useCases.createTrySubmitInvalidAccountFormUseCase();
  this.lastError = await trySubmitUseCase.execute(formData);
});

Then("I should see validation errors", async function (this: CustomWorld) {
  if (!this.useCases) {
    throw new Error("Use cases not initialized. Please ensure account management access was set up.");
  }
  const verifyValidationUseCase =
    this.useCases.createVerifyValidationErrorsUseCase();
  if (!this.lastError) {
    throw new Error("No error found to verify validation errors");
  }
  await verifyValidationUseCase.execute(this.lastError);
});

export {};
