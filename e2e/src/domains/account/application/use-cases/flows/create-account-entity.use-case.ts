import { Account } from "../../../domain/entities/Account.entity";
import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";
import { DomainError } from "./create-bank-account-flow.use-case";

export class CreateAccountEntityUseCase {
  execute(accountFormValue: AccountFormValue): Account {
    try {
      return new Account({
        _accountName: accountFormValue.accountName,
        accountType: accountFormValue.accountType,
        initialBalance: accountFormValue.initialBalance,
        currency: accountFormValue.currency,
        description: accountFormValue.description,
      });
    } catch (domainError) {
      throw domainError instanceof DomainError
        ? domainError
        : new DomainError(
            domainError instanceof Error
              ? domainError.message
              : String(domainError)
          );
    }
  }
}
