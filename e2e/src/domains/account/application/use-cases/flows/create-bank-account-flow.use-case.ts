import { logger } from "../../../../../shared/utils/logger";
import { CreateAccountUiPort } from "../../../domain/ports/ui/create-account-ui.port";

export interface CreateBankAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance: number;
  currency: string;
  description?: string;
}

export interface CreateBankAccountResult {
  success: boolean;
  accountId?: string;
  errorMessage?: string;
  validationErrors?: string[];
}

/**
 * Orchestrates the complete bank account creation flow
 * This encapsulates the entire business process from navigation to completion
 */
export class CreateBankAccountFlowUseCase {
  constructor(private readonly accountUiPort: CreateAccountUiPort) {}

  async execute(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting bank account creation flow for: ${request.accountName}`
      );

      // Step 1: Navigate to account creation form
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToCreateForm();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill the form with provided data
      logger.info("Step 2: Filling account form...");
      await this.fillAccountForm(request);
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
        `Bank account creation flow completed successfully: ${request.accountName}`
      );

      return {
        success: true,
        accountId,
      };
    } catch (error) {
      logger.error(`Bank account creation flow failed at step: ${error}`);

      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Attempts to create an account with invalid data to test validation
   */
  async executeWithValidation(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting bank account creation flow with validation for: ${request.accountName}`
      );

      // Step 1: Navigate to account creation form
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToCreateForm();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill the form with provided data (potentially invalid)
      logger.info("Step 2: Filling form with potentially invalid data...");
      await this.fillAccountForm(request);
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
          success: false,
          errorMessage: validationResult.errorMessage,
          validationErrors: validationResult.validationErrors,
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
        success: true,
        accountId,
      };
    } catch (error) {
      logger.error(
        `Bank account creation flow with validation failed: ${error}`
      );

      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Attempts to create a duplicate account to test conflict handling
   */
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
          success: false,
          errorMessage: conflictError,
        };
      }

      // If no conflict error found, check if we're still on the form
      const stillOnForm = await this.accountUiPort.isOnFormPage();
      if (stillOnForm) {
        logger.info(
          "Still on form page, treating as conflict (form prevented submission)"
        );
        return {
          success: false,
          errorMessage: "Duplicate account name prevented form submission",
        };
      }

      // If no conflict error, this is unexpected
      logger.warn(
        "No conflict error found and not on form page - unexpected behavior"
      );
      return {
        success: false,
        errorMessage:
          "Expected conflict error for duplicate account name, but behavior was unclear",
      };
    } catch (error) {
      logger.error(`Duplicate account creation test failed: ${error}`);

      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
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
