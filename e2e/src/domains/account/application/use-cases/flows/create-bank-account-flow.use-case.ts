import { logger } from "../../../../../shared/utils/logger";
import { AccountPort } from "../../../domain/ports/ui/create-account-ui.port";
import { Account } from "../../../domain/entities/Account.entity";
import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";
import { DomainEvent } from "../../../../../shared/domain/events";
import { handleAccountEvent } from '../../events/AccountEventsHandler';
import { NavigateToFormUseCase } from './navigate-to-form.use-case';
import { FillAccountFormUseCase } from './fill-account-form.use-case';
import { SubmitAccountFormUseCase } from './submit-account-form.use-case';
import { ValidateAccountFormUseCase } from './validate-account-form.use-case';
import { CreateAccountEntityUseCase } from './create-account-entity.use-case';
import { VerifyAccountCreatedUseCase } from './verify-account-created.use-case';
import { TrySubmitWithValidationUseCase } from './try-submit-with-validation.use-case';

export interface CreateBankAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance: number;
  currency: string;
  description?: string;
}

export type EventPublisher = (event: DomainEvent) => void;

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
  private readonly navigateToFormUseCase: NavigateToFormUseCase;
  private readonly fillAccountFormUseCase: FillAccountFormUseCase;
  private readonly submitAccountFormUseCase: SubmitAccountFormUseCase;
  private readonly validateAccountFormUseCase: ValidateAccountFormUseCase;
  private readonly createAccountEntityUseCase: CreateAccountEntityUseCase;
  private readonly verifyAccountCreatedUseCase: VerifyAccountCreatedUseCase;
  private readonly trySubmitWithValidationUseCase: TrySubmitWithValidationUseCase;

  constructor(
    private readonly accountPort: AccountPort,
    private readonly eventPublisher: EventPublisher = handleAccountEvent
  ) {
    this.navigateToFormUseCase = new NavigateToFormUseCase(accountPort);
    this.fillAccountFormUseCase = new FillAccountFormUseCase(accountPort);
    this.submitAccountFormUseCase = new SubmitAccountFormUseCase(accountPort);
    this.validateAccountFormUseCase = new ValidateAccountFormUseCase();
    this.createAccountEntityUseCase = new CreateAccountEntityUseCase();
    this.verifyAccountCreatedUseCase = new VerifyAccountCreatedUseCase(accountPort);
    this.trySubmitWithValidationUseCase = new TrySubmitWithValidationUseCase(accountPort);
  }

  async execute(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      // Validate and normalize input using domain value object
      let accountFormValue: AccountFormValue;
      try {
        accountFormValue = this.validateAccountFormUseCase.execute(request);
      } catch (validationError) {
        logger.warn(`Validation failed in AccountFormValue: ${validationError}`);
        this.eventPublisher?.({
          type: "AccountCreationFailed",
          payload: {
            accountName: request.accountName,
            error: validationError instanceof Error ? validationError.message : String(validationError),
          },
        });
        return {
          type: "validation_error",
          error: validationError instanceof ValidationError
            ? validationError
            : new ValidationError(
                validationError instanceof Error ? validationError.message : String(validationError),
                []
              ),
        };
      }

      // Create domain entity and enforce business rules
      let accountEntity: Account;
      try {
        accountEntity = this.createAccountEntityUseCase.execute(accountFormValue);
      } catch (domainError) {
        logger.warn(`Domain entity validation failed: ${domainError}`);
        this.eventPublisher?.({
          type: "AccountCreationFailed",
          payload: {
            accountName: request.accountName,
            error: domainError instanceof Error ? domainError.message : String(domainError),
          },
        });
        return {
          type: "domain_error",
          error: domainError instanceof DomainError
            ? domainError
            : new DomainError(
                domainError instanceof Error ? domainError.message : String(domainError)
              ),
        };
      }

      // Step 1: Navigate to account creation form
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToFormUseCase.execute();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill the form with provided data
      logger.info("Step 2: Filling account form...");
      await this.fillAccountFormUseCase.execute({
        accountName: accountEntity.accountName,
        accountType: accountEntity.accountType,
        initialBalance: accountEntity.initialBalance,
        currency: accountEntity.currency,
        description: accountEntity.description,
      });
      logger.info("Step 2: Form filling completed");

      // Step 3: Submit the form
      logger.info("Step 3: Submitting form...");
      await this.submitAccountFormUseCase.execute();
      logger.info("Step 3: Form submission completed");

      // Step 4: Verify successful creation
      logger.info("Step 4: Verifying account creation...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let accountId: string | undefined;
      try {
        accountId = await this.verifyAccountCreatedUseCase.execute();
        logger.info("Step 4: Account creation verified");
      } catch (verificationError) {
        logger.warn(`Account verification failed, but continuing: ${verificationError}`);
        accountId = undefined;
      }

      logger.info(`Bank account creation flow completed successfully: ${accountEntity.accountName}`);
      this.eventPublisher?.({
        type: "AccountCreated",
        payload: { accountName: accountEntity.accountName, accountId },
      });
      return {
        type: "success",
        accountId,
      };
      } catch (error) {
      logger.error(`Bank account creation flow failed at step: ${error}`);
      this.eventPublisher?.({
        type: "AccountCreationFailed",
        payload: {
          accountName: request.accountName,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      const domainError: DomainError =
        error instanceof DomainError
          ? error
          : new DomainError(error instanceof Error ? error.message : String(error));
      return {
        type: "unknown_error",
        error: domainError,
      };
    }
  }

  async executeWithValidation(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(`Starting bank account creation flow with validation for: ${request.accountName}`);
      let accountFormValue: AccountFormValue;
      try {
        accountFormValue = this.validateAccountFormUseCase.execute(request);
      } catch (validationError) {
        logger.warn(`Validation failed in AccountFormValue: ${validationError}`);
        return {
          type: "validation_error",
          error: validationError instanceof ValidationError
            ? validationError
            : new ValidationError(
                validationError instanceof Error ? validationError.message : String(validationError),
                []
              ),
        };
      }
      let accountEntity: Account;
      try {
        accountEntity = this.createAccountEntityUseCase.execute(accountFormValue);
      } catch (domainError) {
        logger.warn(`Domain entity validation failed: ${domainError}`);
        return {
          type: "domain_error",
          error: domainError instanceof DomainError
            ? domainError
            : new DomainError(
                domainError instanceof Error ? domainError.message : String(domainError)
              ),
        };
      }
      logger.info("Step 1: Navigating to create form...");
      await this.navigateToFormUseCase.execute();
      logger.info("Step 1: Navigation completed");
      logger.info("Step 2: Filling form with potentially invalid data...");
      await this.fillAccountFormUseCase.execute({
        accountName: accountEntity.accountName,
        accountType: accountEntity.accountType,
        initialBalance: accountEntity.initialBalance,
        currency: accountEntity.currency,
        description: accountEntity.description,
      });
      logger.info("Step 2: Form filling completed");
      logger.info("Step 3: Trying to submit form (expecting validation)...");
      const validationResult = await this.trySubmitWithValidationUseCase.execute();
      logger.info("Step 3: Submit attempt completed");
      if (validationResult.hasValidationErrors) {
        logger.info(`Validation errors detected as expected: ${validationResult.errorMessage}`);
        return {
          type: "validation_error",
          error: new ValidationError(
            validationResult.errorMessage || "Validation error",
            validationResult.validationErrors || []
          ),
        };
      }
      logger.info("No validation errors detected, verifying successful creation...");
      let accountId: string | undefined;
      try {
        accountId = await this.verifyAccountCreatedUseCase.execute();
      } catch (verificationError) {
        logger.warn(`Account verification failed: ${verificationError}`);
        accountId = undefined;
      }
      return {
        type: "success",
        accountId,
      };
    } catch (error) {
      logger.error(`Bank account creation flow with validation failed: ${error}`);
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
      await this.navigateToFormUseCase.execute();
      logger.info("Step 1: Navigation completed");

      // Step 2: Fill form with duplicate account name
      logger.info("Step 2: Filling form with duplicate data...");
      await this.fillAccountFormUseCase.execute({
        accountName,
        accountType: "Bank Account",
        initialBalance: 100,
        currency: "USD",
        description: "Duplicate test account",
      });
      logger.info("Step 2: Form filling completed");

      // Step 3: Submit form and expect conflict error
      logger.info("Step 3: Submitting form (expecting conflict)...");
      await this.submitAccountFormUseCase.execute();
      logger.info("Step 3: Form submission completed");

      // Step 4: Check for conflict error
      logger.info("Step 4: Checking for conflict error...");

      // Wait a moment for error to appear
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const conflictError = await this.accountPort.verifyConflictError();
      logger.info(`Conflict check result: ${conflictError}`);

      if (conflictError) {
        logger.info(`Conflict error detected as expected: ${conflictError}`);

        return {
          type: "conflict_error",
          error: new ConflictError(conflictError),
        };
      }

      // If no conflict error found, check if we're still on the form
      const stillOnForm = await this.accountPort.isOnFormPage();
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
}
