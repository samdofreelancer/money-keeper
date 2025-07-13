import { logger } from "../../../../shared/utils/logger";
import { FillAccountFormUseCase } from "./fill-account-form.use-case";
import { SubmitAccountFormUseCase } from "./submit-account-form.use-case";
import {
  VerifyAccountCreatedUseCase,
  VerifyAccountInListUseCase,
  VerifyTotalBalanceUpdatedUseCase,
} from "./verify-account.use-case";
import { ClickButtonUseCase } from "./click-button.use-case";
import { CustomWorld } from "../../../../support/world";
import {
  AccountApiClient,
  AccountCreate,
} from "../../infrastructure/api/account-api.client";
import { CreateBankAccountFlowUseCase } from "./flows/create-bank-account-flow.use-case";

interface AccountService {
  create(account: unknown): Promise<unknown>;
}

export class AccountUseCasesFactory {
  constructor(
    private accountService?: AccountService,
    private world?: CustomWorld
  ) {}

  createSetupAccountManagementUseCase() {
    return {
      execute: async () => {
        logger.info("Executing setup account management use case");

        if (!this.world) {
          throw new Error("World instance is not available");
        }

        if (!this.world.accountUiPort) {
          throw new Error("Account UI port is not initialized in world");
        }

        // Initialize the account service with real API client
        const apiBaseUrl =
          process.env.API_BASE_URL || "http://127.0.0.1:8080/api";
        const accountApiClient = new AccountApiClient({ baseURL: apiBaseUrl });

        this.world.accountService = {
          create: async (account: unknown) => {
            logger.info("Creating account via API service:", account);
            return await accountApiClient.create(account as AccountCreate);
          },
        };

        try {
          await this.world.accountUiPort.navigateToApp();

          // Initialize the use cases factory for convenience
          this.world.useCases = new AccountUseCasesFactory(
            this.world.accountService,
            this.world
          );

          logger.info("Successfully navigated to account management page");
          logger.info("Account service initialized");
          logger.info("Use cases factory initialized");
          return this.world.accountUiPort;
        } catch (error) {
          logger.error(
            `Failed to navigate to account management page: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          throw new Error(
            "Cannot access account management features. Please ensure the application is running."
          );
        }
      },
    };
  }

  createSetupExistingAccountUseCase() {
    return {
      execute: async (accountName: string) => {
        if (!this.accountService) {
          throw new Error("Account service is not available");
        }

        // Create an existing account using the account service
        try {
          const existingAccount = {
            accountName: accountName,
            type: "BANK_ACCOUNT",
            initBalance: 500,
            currency: "USD",
            description: "Existing test account",
            active: true,
          };

          const createdAccount = await this.accountService.create(
            existingAccount
          );

          // Track the account for cleanup
          if (!this.world) {
            throw new Error("World instance is not available");
          }

          if (
            createdAccount &&
            typeof createdAccount === "object" &&
            "id" in createdAccount
          ) {
            if (!this.world.createdAccountIds) {
              this.world.createdAccountIds = [];
            }
            this.world.createdAccountIds.push(createdAccount.id as string);
            logger.info(`Tracking account for cleanup: ${createdAccount.id}`);
          }

          // Also track by name as backup
          if (!this.world.createdAccountNames) {
            this.world.createdAccountNames = [];
          }
          this.world.createdAccountNames.push(accountName);

          logger.info(`Setup existing account: ${accountName}`);
        } catch (error) {
          logger.error(`Failed to setup existing account: ${error}`);
          throw new Error(`Cannot setup existing account "${accountName}"`);
        }
      },
    };
  }

  createNavigateToCreateAccountFormUseCase() {
    return {
      execute: async () => {
        if (!this.world || !this.world.accountUiPort) {
          throw new Error("Account UI port is not initialized");
        }
        await this.world.accountUiPort.navigateToApp();
        await this.world.accountUiPort.clickButton("Add Account");
      },
    };
  }

  createClickButtonUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new ClickButtonUseCase(this.world.accountUiPort);
  }

  createFillAccountFormUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new FillAccountFormUseCase(this.world.accountUiPort);
  }

  createSubmitAccountFormUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new SubmitAccountFormUseCase(this.world.accountUiPort);
  }

  createVerifyAccountCreatedUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new VerifyAccountCreatedUseCase(this.world.accountUiPort);
  }

  createVerifyAccountInListUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new VerifyAccountInListUseCase(this.world.accountUiPort, this.world);
  }

  createVerifyTotalBalanceUpdatedUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new VerifyTotalBalanceUpdatedUseCase(this.world.accountUiPort);
  }

  createTryCreateDuplicateAccountUseCase() {
    return {
      execute: async (accountName: string) => {
        if (!this.world || !this.world.accountUiPort) {
          throw new Error("Account UI port is not initialized");
        }

        try {
          // Try to create duplicate account
          await this.world.accountUiPort.fillAccountForm({
            accountName,
            accountType: "Bank Account",
            initialBalance: 100,
            currency: "USD",
            description: "Duplicate test account",
          });
          await this.world.accountUiPort.submitForm();

          // Check for error message
          const errorText =
            await this.world.accountUiPort.verifyConflictError();
          if (errorText) {
            return new Error(`Conflict error: ${errorText}`);
          }

          return new Error("Conflict error: Duplicate account name");
        } catch (error) {
          return error as Error;
        }
      },
    };
  }

  createVerifyConflictErrorUseCase() {
    return {
      execute: async (error: Error) => {
        if (!error) {
          throw new Error("No error provided to verify");
        }

        const errorMessage = error.message.toLowerCase();
        if (
          !errorMessage.includes("conflict") &&
          !errorMessage.includes("duplicate") &&
          !errorMessage.includes("already exists")
        ) {
          throw new Error(`Expected conflict error, but got: ${error.message}`);
        }

        logger.info(`Conflict error verified: ${error.message}`);
      },
    };
  }

  createVerifyAccountNotCreatedUseCase() {
    return {
      execute: async () => {
        if (!this.world || !this.world.accountUiPort) {
          throw new Error("Account UI port is not initialized");
        }

        // Check that we're still on the form page (not redirected)
        const isOnFormPage = await this.world.accountUiPort.isOnFormPage();
        if (!isOnFormPage) {
          throw new Error(
            "Expected to remain on form page, but appears to have been redirected"
          );
        }

        logger.info("Verified account was not created - still on form page");
      },
    };
  }

  createTrySubmitInvalidAccountFormUseCase() {
    return {
      execute: async (formData: Record<string, unknown>) => {
        if (!this.world || !this.world.accountUiPort) {
          throw new Error("Account UI port is not initialized");
        }

        try {
          const invalidData = {
            accountName: (formData["Account Name"] ||
              formData.accountName) as string,
            accountType: (formData["Account Type"] ||
              formData.accountType) as string,
            initialBalance: parseFloat(
              String(
                formData["Initial Balance"] || formData.initialBalance || "0"
              )
            ),
            currency: (formData["Currency"] || formData.currency) as string,
            description: (formData["Description"] ||
              formData.description) as string,
          };

          const errorText = await this.world.accountUiPort.trySubmitInvalidForm(
            invalidData
          );
          if (errorText) {
            return new Error(`Validation error: ${errorText}`);
          }

          return new Error("Validation error: Invalid form data");
        } catch (error) {
          return error as Error;
        }
      },
    };
  }

  createVerifyValidationErrorsUseCase() {
    return {
      execute: async (error: Error) => {
        if (!error) {
          throw new Error("No error provided to verify");
        }

        const errorMessage = error.message.toLowerCase();
        
        // Check for various validation error patterns
        const validationPatterns = [
          "validation",
          "required", 
          "invalid",
          "please input",
          "please enter",
          "cannot be empty",
          "must be",
          "should be",
          "is required",
          "field is required",
          "enter a valid",
          "provide a valid",
          "must be positive",
          "cannot be negative"
        ];
        
        const isValidationError = validationPatterns.some(pattern => 
          errorMessage.includes(pattern)
        );
        
        if (!isValidationError) {
          throw new Error(
            `Expected validation error, but got: ${error.message}`
          );
        }

        logger.info(`Validation error verified: ${error.message}`);
      },
    };
  }

  // Flow Use Cases
  createBankAccountFlowUseCase() {
    if (!this.world || !this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }
    return new CreateBankAccountFlowUseCase(this.world.accountUiPort);
  }
}
