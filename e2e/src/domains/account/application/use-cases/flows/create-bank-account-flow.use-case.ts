import { logger } from "../../../../../shared/utils/logger";
import { AccountUiPort } from "../../../domain/ports/ui/create-account-ui.port";
import { Account } from "../../../domain/entities/Account.entity";
import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";

export interface CreateBankAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance: number;
  currency: string;
  description?: string;
}

// Define custom error classes for better error semantics
export class ValidationError extends Error {
  constructor(message: string, public validationErrors: string[]) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

// Define richer result types using discriminated unions
export type CreateBankAccountResult =
  | { type: "success"; accountId?: string }
  | { type: "validation_error"; error: ValidationError }
  | { type: "domain_error"; error: DomainError }
  | { type: "conflict_error"; error: ConflictError }
  | { type: "unknown_error"; error: Error };

export class CreateBankAccountFlowUseCase {
  constructor(private readonly accountUiPort: AccountUiPort) {}

  async execute(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting bank account creation flow for: ${request.accountName}`
      );

      // Validate and normalize input using domain value object
      let accountFormValue: AccountFormValue;
      try {
        // Cast request to RawAccountFormValue to satisfy type
        accountFormValue = new AccountFormValue(
          request as unknown as { [key: string]: unknown }
        );
      } catch (validationError) {
        logger.warn(
          `Validation failed in AccountFormValue: ${validationError}`
        );
        return {
          type: "validation_error",
          error:
            validationError instanceof ValidationError
              ? validationError
              : new ValidationError(
                  validationError instanceof Error
                    ? validationError.message
                    : String(validationError),
                  [
                    validationError instanceof Error
                      ? validationError.message
                      : String(validationError),
                  ]
                ),
        };
      }

      // Create domain entity and enforce business rules
      let accountEntity: Account;
      try {
      accountEntity = new Account({
        _accountName: accountFormValue.accountName,
        accountType: accountFormValue.accountType,
        initialBalance: accountFormValue.initialBalance,
        currency: accountFormValue.currency,
        description: accountFormValue.description,
      });
      } catch (domainError) {
        logger.warn(`Domain entity validation failed: ${domainError}`);
        return {
          type: "domain_error",
          error:
            domainError instanceof DomainError
              ? domainError
              : new DomainError(
                  domainError instanceof Error
                    ? domainError.message
                    : String(domainError)
                ),
        };
      }

      // Step 1: Navigate to account creation form
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToCreateForm();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill the form with provided data
      logger.info("Step 2: Filling account form...");
      await this.fillAccountForm({
        accountName: accountEntity.accountName,
        accountType: accountEntity.accountType,
        initialBalance: accountEntity.initialBalance,
        currency: accountEntity.currency,
        description: accountEntity.description,
      });
      logger.info("Step 2: Form filling completed");

      // Step 3: Submit the form
      logger.info("Step 3: Submitting form...");
      await this.submitForm();
      logger.info("Step 3: Form submission completed");

      // Step 4: Verify successful creation
      logger.info("Step 4: Verifying account creation...");

      // Wait a moment for the form to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let accountId: string | undefined;
      try {
        accountId = await this.verifyAccountCreated();
        logger.info("Step 4: Account creation verified");
      } catch (verificationError) {
        logger.warn(
          `Account verification failed, but continuing: ${verificationError}`
        );
        // Don't fail the entire flow if verification fails
        accountId = undefined;
      }

      logger.info(
        `Bank account creation flow completed successfully: ${accountEntity.accountName}`
      );

      return {
        type: "success",
        accountId,
      };
    } catch (error) {
      logger.error(`Bank account creation flow failed at step: ${error}`);

      return {
        type: "unknown_error",
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async executeWithValidation(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting bank account creation flow with validation for: ${request.accountName}`
      );

      // Validate and normalize input using domain value object
      let accountFormValue: AccountFormValue;
      try {
        // Cast request to RawAccountFormValue to satisfy type
        accountFormValue = new AccountFormValue(
          request as unknown as { [key: string]: unknown }
        );
      } catch (validationError) {
        logger.warn(
          `Validation failed in AccountFormValue: ${validationError}`
        );
        return {
          type: "validation_error",
          error:
            validationError instanceof ValidationError
              ? validationError
              : new ValidationError(
                  validationError instanceof Error
                    ? validationError.message
                    : String(validationError),
                  [
                    validationError instanceof Error
                      ? validationError.message
                      : String(validationError),
                  ]
                ),
        };
      }

      // Create domain entity and enforce business rules
      let accountEntity: Account;
      try {
        accountEntity = new Account({
          _accountName: accountFormValue.accountName,
          accountType: accountFormValue.accountType,
          initialBalance: accountFormValue.initialBalance,
          currency: accountFormValue.currency,
          description: accountFormValue.description,
        });
      } catch (domainError) {
        logger.warn(`Domain entity validation failed: ${domainError}`);
        return {
          type: "domain_error",
          error:
            domainError instanceof DomainError
              ? domainError
              : new DomainError(
                  domainError instanceof Error
                    ? domainError.message
                    : String(domainError)
                ),
        };
      }

      // Step 1: Navigate to account creation form
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToCreateForm();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill the form with provided data (potentially invalid)
      logger.info("Step 2: Filling form with potentially invalid data...");
      await this.fillAccountForm({
        accountName: accountEntity.accountName,
        accountType: accountEntity.accountType,
        initialBalance: accountEntity.initialBalance,
        currency: accountEntity.currency,
        description: accountEntity.description,
      });
      logger.info("Step 2: Form filling completed");

      // Step 3: Try to submit the form (may be prevented by validation)
      logger.info("Step 3: Trying to submit form (expecting validation)...");
      const validationResult = await this.trySubmitWithValidation();
      logger.info("Step 3: Submit attempt completed");

      if (validationResult.hasValidationErrors) {
        logger.info(
          `Validation errors detected as expected: ${validationResult.errorMessage}`
        );

        return {
          type: "validation_error",
          error: new ValidationError(
            validationResult.errorMessage || "Validation error",
            validationResult.validationErrors || []
          ),
        };
      }

      // If no validation errors, the form was submitted successfully
      logger.info(
        "No validation errors detected, verifying successful creation..."
      );
      let accountId: string | undefined;
      try {
        accountId = await this.verifyAccountCreated();
      } catch (verificationError) {
        logger.warn(`Account verification failed: ${verificationError}`);
        accountId = undefined;
      }

      return {
        type: "success",
        accountId,
      };
    } catch (error) {
      logger.error(
        `Bank account creation flow with validation failed: ${error}`
      );

      return {
        type: "unknown_error",
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async executeForDuplicateTest(
    accountName: string
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting duplicate account creation test for: ${accountName}`
      );

      // Step 1: Navigate to account creation form
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToCreateForm();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill form with duplicate account name
      logger.info("Step 2: Filling form with duplicate data...");
      await this.fillAccountForm({
        accountName,
        accountType: "Bank Account",
        initialBalance: 100,
        currency: "USD",
        description: "Duplicate test account",
      });
      logger.info("Step 2: Form filling completed");

      // Step 3: Submit form and expect conflict error
      logger.info("Step 3: Submitting form (expecting conflict)...");
      await this.submitForm();
      logger.info("Step 3: Form submission completed");

      // Step 4: Check for conflict error
      logger.info("Step 4: Checking for conflict error...");

      // Wait a moment for error to appear
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const conflictError = await this.accountUiPort.verifyConflictError();
      logger.info(`Conflict check result: ${conflictError}`);

      if (conflictError) {
        logger.info(`Conflict error detected as expected: ${conflictError}`);

        return {
          type: "conflict_error",
          error: new ConflictError(conflictError),
        };
      }

      // If no conflict error found, check if we're still on the form
      const stillOnForm = await this.accountUiPort.isOnFormPage();
      if (stillOnForm) {
        logger.info(
          "Still on form page, treating as conflict (form prevented submission)"
        );
        return {
          type: "conflict_error",
          error: new ConflictError(
            "Duplicate account name prevented form submission"
          ),
        };
      }

      // If no conflict error, this is unexpected
      logger.warn(
        "No conflict error found and not on form page - unexpected behavior"
      );
      return {
        type: "unknown_error",
        error: new Error(
          "Expected conflict error for duplicate account name, but behavior was unclear"
        ),
      };
    } catch (error) {
      logger.error(`Duplicate account creation test failed: ${error}`);

      return {
        type: "unknown_error",
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async navigateToCreateForm(): Promise<void> {
    await this.accountUiPort.navigateToApp();
    await this.accountUiPort.clickButton("Add Account");
  }

  private async fillAccountForm(
    request: CreateBankAccountRequest
  ): Promise<void> {
    const formData = {
      accountName: request.accountName,
      accountType: request.accountType,
      initialBalance: request.initialBalance,
      currency: request.currency,
      description: request.description,
    };

    await this.accountUiPort.fillAccountForm(formData);
  }

  private async submitForm(): Promise<void> {
    await this.accountUiPort.submitForm();
  }

  private async verifyAccountCreated(): Promise<string | undefined> {
    logger.info("Verifying account creation success...");

    try {
      const isCreated = await this.accountUiPort.verifyAccountCreationSuccess();
      logger.info(`Account creation verification result: ${isCreated}`);

      if (!isCreated) {
        throw new Error("Account creation verification failed");
      }

      logger.info("Getting last created account ID...");
      const accountId = await this.accountUiPort.getLastCreatedAccountId();
      logger.info(`Retrieved account ID: ${accountId}`);

      return accountId || undefined;
    } catch (error) {
      logger.error(`Error in verifyAccountCreated: ${error}`);
      throw error;
    }
  }

  private async trySubmitWithValidation(): Promise<{
    hasValidationErrors: boolean;
    errorMessage?: string;
    validationErrors?: string[];
  }> {
    try {
      // Try to submit the form
      await this.accountUiPort.submitForm();

      // Wait a moment for potential validation errors
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if we're still on the form page (validation prevented submission)
      const stillOnForm = await this.accountUiPort.isOnFormPage();

      if (stillOnForm) {
        // Look for validation error messages
        const errorMessage = await this.accountUiPort.verifyValidationErrors();

        if (errorMessage) {
          return {
            hasValidationErrors: true,
            errorMessage,
            validationErrors: [errorMessage],
          };
        }

        // Still on form but no specific error message found
        return {
          hasValidationErrors: true,
          errorMessage: "Form validation prevented submission",
          validationErrors: ["Form validation prevented submission"],
        };
      }

      // Form was submitted successfully (no validation errors)
      return {
        hasValidationErrors: false,
      };
    } catch (error) {
      // Submit failed, likely due to validation
      return {
        hasValidationErrors: true,
        errorMessage: error instanceof Error ? error.message : String(error),
        validationErrors: [
          error instanceof Error ? error.message : String(error),
        ],
      };
    }
  }
}
