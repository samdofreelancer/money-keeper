import { Account } from "../../../domain/entities/Account.entity";
import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";
import { DomainError } from "./shared/types/CreateBankAccountTypes";

export class CreateAccountEntityUseCase {
  execute(accountFormValue: AccountFormValue): Account {
    try {
      return new Account({
        _accountName: accountFormValue.accountName,
        accountType: this.mapAccountType(accountFormValue.accountType),
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

  private mapAccountType(formAccountType: string): string {
    const accountTypeMap: { [key: string]: string } = {
      BANK_ACCOUNT: "Bank Account",
      SAVINGS_ACCOUNT: "Bank Account", // Map savings to bank account for now
      CREDIT_ACCOUNT: "Credit Card",
      INVESTMENT_ACCOUNT: "Investment",
    };

    return accountTypeMap[formAccountType] || formAccountType;
  }
}
