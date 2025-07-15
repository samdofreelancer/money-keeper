import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";
import {
  CreateBankAccountRequest,
  ValidationError,
} from "./create-bank-account-flow.use-case";

export class ValidateAccountFormUseCase {
  execute(request: CreateBankAccountRequest): AccountFormValue {
    try {
      return new AccountFormValue(
        request as unknown as { [key: string]: unknown }
      );
    } catch (validationError) {
      throw validationError instanceof ValidationError
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
          );
    }
  }
}
