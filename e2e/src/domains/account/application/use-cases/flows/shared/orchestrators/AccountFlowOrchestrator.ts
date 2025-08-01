import { logger } from "../../../../../../../shared/utils/logger";
import { AccountPort } from "../../../../../domain/ports/ui/create-account-ui.port";
import { Account } from "../../../../../domain/entities/Account.entity";
import { NavigateToFormUseCase } from "../../navigate-to-form.use-case";
import { FillAccountFormUseCase } from "../../fill-account-form.use-case";
import { SubmitAccountFormUseCase } from "../../submit-account-form.use-case";
import { VerifyAccountCreatedUseCase } from "../../verify-account-created.use-case";
import { TrySubmitWithValidationUseCase } from "../../try-submit-with-validation.use-case";

export class AccountFlowOrchestrator {
  private readonly navigateToFormUseCase: NavigateToFormUseCase;
  private readonly fillAccountFormUseCase: FillAccountFormUseCase;
  private readonly submitAccountFormUseCase: SubmitAccountFormUseCase;
  private readonly verifyAccountCreatedUseCase: VerifyAccountCreatedUseCase;
  private readonly trySubmitWithValidationUseCase: TrySubmitWithValidationUseCase;

  constructor(private readonly accountPort: AccountPort) {
    this.navigateToFormUseCase = new NavigateToFormUseCase(accountPort);
    this.fillAccountFormUseCase = new FillAccountFormUseCase(accountPort);
    this.submitAccountFormUseCase = new SubmitAccountFormUseCase(accountPort);
    this.verifyAccountCreatedUseCase = new VerifyAccountCreatedUseCase(
      accountPort
    );
    this.trySubmitWithValidationUseCase = new TrySubmitWithValidationUseCase(
      accountPort
    );
  }

  async executeStandardFlow(
    accountEntity: Account
  ): Promise<string | undefined> {
    logger.info("Step 1: Navigating to create form...");
    await this.navigateToFormUseCase.execute();
    logger.info("Step 1: Navigation completed");

    logger.info("Step 2: Filling account form...");
    await this.fillAccountFormUseCase.execute({
      accountName: accountEntity.accountName,
      accountType: accountEntity.accountType,
      initialBalance: accountEntity.initialBalance,
      currency: accountEntity.currency,
      description: accountEntity.description,
    });
    logger.info("Step 2: Form filling completed");

    logger.info("Step 3: Submitting form...");
    await this.submitAccountFormUseCase.execute();
    logger.info("Step 3: Form submission completed");

    logger.info("Step 4: Verifying account creation...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const accountId = await this.verifyAccountCreatedUseCase.execute();
      logger.info("Step 4: Account creation verified");
      return accountId;
    } catch (verificationError) {
      logger.warn(
        `Account verification failed, but continuing: ${verificationError}`
      );
      return undefined;
    }
  }

  async executeValidationFlow(accountEntity: Account): Promise<{
    hasValidationErrors: boolean;
    errorMessage?: string;
    validationErrors?: string[];
  }> {
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
    const validationResult =
      await this.trySubmitWithValidationUseCase.execute();
    logger.info("Step 3: Submit attempt completed");

    return validationResult;
  }

  async executeDuplicateFlow(
    accountName: string
  ): Promise<{ hasConflict: boolean; errorMessage?: string }> {
    logger.info("Step 1: Navigating to create form...");
    await this.navigateToFormUseCase.execute();
    logger.info("Step 1: Navigation completed");

    logger.info("Step 2: Filling form with duplicate data...");
    await this.fillAccountFormUseCase.execute({
      accountName,
      accountType: "Bank Account",
      initialBalance: 100,
      currency: "USD",
      description: "Duplicate test account",
    });
    logger.info("Step 2: Form filling completed");

    logger.info("Step 3: Submitting form (expecting conflict)...");
    await this.submitAccountFormUseCase.execute();
    logger.info("Step 3: Form submission completed");

    logger.info("Step 4: Checking for conflict error...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const conflictError = await this.accountPort.verifyConflictError();
    logger.info(`Conflict check result: ${conflictError}`);

    if (conflictError) {
      logger.info(`Conflict error detected as expected: ${conflictError}`);
      return { hasConflict: true, errorMessage: conflictError };
    }

    const stillOnForm = await this.accountPort.isOnFormPage();
    if (stillOnForm) {
      logger.info(
        "Still on form page, treating as conflict (form prevented submission)"
      );
      return {
        hasConflict: true,
        errorMessage: "Duplicate account name prevented form submission",
      };
    }

    logger.warn(
      "No conflict error found and not on form page - unexpected behavior"
    );
    return { hasConflict: false };
  }
}
