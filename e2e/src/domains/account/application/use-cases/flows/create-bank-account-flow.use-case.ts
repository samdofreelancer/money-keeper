import { logger } from "../../../../../shared/utils/logger";
import { AccountPort } from "../../../domain/ports/ui/create-account-ui.port";
import { handleAccountEvent } from "../../events/AccountEventsHandler";
import {
  CreateBankAccountRequest,
  CreateBankAccountResult,
  EventPublisher,
  ValidationError,
  DomainError,
  ConflictError,
} from "./shared/types/CreateBankAccountTypes";
import { AccountValidationService } from "./shared/services/AccountValidationService";
import { AccountFlowOrchestrator } from "./shared/orchestrators/AccountFlowOrchestrator";
import { CreateBankAccountResultMapper } from "./shared/mappers/CreateBankAccountResultMapper";

// Re-export types for backward compatibility
export {
  CreateBankAccountRequest,
  CreateBankAccountResult,
  EventPublisher,
  ValidationError,
  DomainError,
  ConflictError,
};

export class CreateBankAccountFlowUseCase {
  private readonly validationService: AccountValidationService;
  private readonly flowOrchestrator: AccountFlowOrchestrator;
  private readonly resultMapper: CreateBankAccountResultMapper;

  constructor(
    private readonly accountPort: AccountPort,
    private readonly eventPublisher: EventPublisher = handleAccountEvent
  ) {
    this.validationService = new AccountValidationService();
    this.flowOrchestrator = new AccountFlowOrchestrator(accountPort);
    this.resultMapper = new CreateBankAccountResultMapper(eventPublisher);
  }

  async execute(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting bank account creation flow for: ${request.accountName}`
      );
      const accountFormValue = this.validationService.validateFormData(request);
      const accountEntity =
        this.validationService.createDomainEntity(accountFormValue);
      logger.info(
        `Validated account form data for: ${accountEntity.accountName}`
      );
      const accountId = await this.flowOrchestrator.executeStandardFlow(
        accountEntity
      );

      return this.resultMapper.mapSuccess(accountEntity.accountName, accountId);
    } catch (error) {
      if (error instanceof ValidationError) {
        return this.resultMapper.mapValidationError(error, request);
      }

      if (error instanceof DomainError) {
        return this.resultMapper.mapDomainError(error, request);
      }

      return this.resultMapper.mapUnknownError(error, request);
    }
  }

  async executeWithValidation(
    request: CreateBankAccountRequest
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting bank account creation flow with validation for: ${request.accountName}`
      );

      const accountFormValue = this.validationService.validateFormData(request);
      const accountEntity =
        this.validationService.createDomainEntity(accountFormValue);

      const validationResult =
        await this.flowOrchestrator.executeValidationFlow(accountEntity);

      if (validationResult.hasValidationErrors) {
        logger.info(
          `Validation errors detected as expected: ${validationResult.errorMessage}`
        );
        return this.resultMapper.mapValidationError(
          new ValidationError(
            validationResult.errorMessage || "Validation error",
            validationResult.validationErrors || []
          ),
          request
        );
      }

      logger.info(
        "No validation errors detected, verifying successful creation..."
      );
      return this.resultMapper.mapSuccess(accountEntity.accountName, undefined);
    } catch (error) {
      if (error instanceof ValidationError) {
        return this.resultMapper.mapValidationError(error, request);
      }

      if (error instanceof DomainError) {
        return this.resultMapper.mapDomainError(error, request);
      }

      return this.resultMapper.mapUnknownError(error, request);
    }
  }

  async executeForDuplicateTest(
    accountName: string
  ): Promise<CreateBankAccountResult> {
    try {
      logger.info(
        `Starting duplicate account creation test for: ${accountName}`
      );

      const duplicateResult = await this.flowOrchestrator.executeDuplicateFlow(
        accountName
      );

      if (duplicateResult.hasConflict) {
        return this.resultMapper.mapConflictError(
          new ConflictError(
            duplicateResult.errorMessage || "Duplicate account name conflict"
          )
        );
      }

      logger.warn(
        "No conflict error found and not on form page - unexpected behavior"
      );
      return this.resultMapper.mapUnknownError(
        new Error(
          "Expected conflict error for duplicate account name, but behavior was unclear"
        ),
        {
          accountName,
          accountType: "Bank Account",
          initialBalance: 100,
          currency: "USD",
        }
      );
    } catch (error) {
      return this.resultMapper.mapUnknownError(error, {
        accountName,
        accountType: "Bank Account",
        initialBalance: 100,
        currency: "USD",
      });
    }
  }
}
