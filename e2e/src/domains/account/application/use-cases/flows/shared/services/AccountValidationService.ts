import { AccountFormValue } from "../../../../../domain/value-objects/account-form-data.vo";
import { Account } from "../../../../../domain/entities/Account.entity";
import {
  ValidationError,
  DomainError,
} from "../errors/CreateBankAccountErrors";
import { CreateBankAccountRequest } from "../types/CreateBankAccountTypes";
import { ValidateAccountFormUseCase } from "../../validate-account-form.use-case";
import { CreateAccountEntityUseCase } from "../../create-account-entity.use-case";

export class AccountValidationService {
  private readonly validateAccountFormUseCase: ValidateAccountFormUseCase;
  private readonly createAccountEntityUseCase: CreateAccountEntityUseCase;

  constructor() {
    this.validateAccountFormUseCase = new ValidateAccountFormUseCase();
    this.createAccountEntityUseCase = new CreateAccountEntityUseCase();
  }

  validateFormData(request: CreateBankAccountRequest): AccountFormValue {
    try {
      return this.validateAccountFormUseCase.execute(request);
    } catch (error) {
      throw this.normalizeValidationError(error);
    }
  }

  createDomainEntity(accountFormValue: AccountFormValue): Account {
    try {
      return this.createAccountEntityUseCase.execute(accountFormValue);
    } catch (error) {
      throw this.normalizeDomainError(error);
    }
  }

  private normalizeValidationError(error: unknown): ValidationError {
    if (error instanceof ValidationError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    return new ValidationError(message, []);
  }

  private normalizeDomainError(error: unknown): DomainError {
    if (error instanceof DomainError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    return new DomainError(message);
  }
}
