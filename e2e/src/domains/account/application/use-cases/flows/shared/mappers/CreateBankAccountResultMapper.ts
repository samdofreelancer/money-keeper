import { logger } from "../../../../../../../shared/utils/logger";
import {
  CreateBankAccountResult,
  CreateBankAccountRequest,
  EventPublisher,
} from "../types/CreateBankAccountTypes";
import {
  ValidationError,
  DomainError,
  ConflictError,
} from "../errors/CreateBankAccountErrors";

export class CreateBankAccountResultMapper {
  constructor(private readonly eventPublisher?: EventPublisher) {}

  mapSuccess(accountName: string, accountId?: string): CreateBankAccountResult {
    logger.info(
      `Bank account creation flow completed successfully: ${accountName}`
    );

    this.eventPublisher?.({
      type: "AccountCreated",
      payload: { accountName, accountId },
    });

    return {
      type: "success",
      accountId,
    };
  }

  mapValidationError(
    error: ValidationError,
    request: CreateBankAccountRequest
  ): CreateBankAccountResult {
    logger.warn(`Validation failed: ${error.message}`);

    this.eventPublisher?.({
      type: "AccountCreationFailed",
      payload: {
        accountName: request.accountName,
        error: error.message,
      },
    });

    return {
      type: "validation_error",
      error,
    };
  }

  mapDomainError(
    error: DomainError,
    request: CreateBankAccountRequest
  ): CreateBankAccountResult {
    logger.warn(`Domain entity validation failed: ${error.message}`);

    this.eventPublisher?.({
      type: "AccountCreationFailed",
      payload: {
        accountName: request.accountName,
        error: error.message,
      },
    });

    return {
      type: "domain_error",
      error,
    };
  }

  mapConflictError(error: ConflictError): CreateBankAccountResult {
    logger.info(`Conflict error detected: ${error.message}`);

    return {
      type: "conflict_error",
      error,
    };
  }

  mapUnknownError(
    error: unknown,
    request: CreateBankAccountRequest
  ): CreateBankAccountResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Bank account creation flow failed: ${errorMessage}`);

    this.eventPublisher?.({
      type: "AccountCreationFailed",
      payload: {
        accountName: request.accountName,
        error: errorMessage,
      },
    });

    const mappedError =
      error instanceof Error ? error : new Error(errorMessage);
    return {
      type: "unknown_error",
      error: mappedError,
    };
  }
}
