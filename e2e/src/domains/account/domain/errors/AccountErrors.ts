/**
 * Base class for all account-related domain errors
 */
export abstract class AccountError extends Error {
  abstract readonly type: string;

  constructor(message: string, public readonly details?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Validation error for account form data
 */
export class ValidationError extends AccountError {
  readonly type = "validation";

  constructor(message: string, details?: string) {
    super(message, details);
  }
}

/**
 * Domain business rule violation error
 */
export class DomainError extends AccountError {
  readonly type = "domain";

  constructor(message: string, details?: string) {
    super(message, details);
  }
}

/**
 * Account not found error
 */
export class AccountNotFoundError extends AccountError {
  readonly type = "not_found";

  constructor(identifier: string) {
    super(`Account not found: ${identifier}`);
  }
}

/**
 * Account already exists error
 */
export class AccountAlreadyExistsError extends DomainError {
  constructor(accountName: string) {
    super(`Account with name "${accountName}" already exists`);
  }
}
