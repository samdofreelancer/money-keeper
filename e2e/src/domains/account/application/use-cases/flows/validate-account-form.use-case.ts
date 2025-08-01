import { logger } from "../../../../../shared/utils/logger";
import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";
import {
  CreateBankAccountRequest,
  ValidationError,
} from "./shared/types/CreateBankAccountTypes";

export class ValidateAccountFormUseCase {
  execute(request: CreateBankAccountRequest): AccountFormValue {
    try {
      logger.info(`Validating account form data for: ${request.accountName}`);
      return AccountFormValue.fromRawInput(
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
