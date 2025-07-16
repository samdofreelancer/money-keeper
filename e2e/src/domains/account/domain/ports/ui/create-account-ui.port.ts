// e2e/src/domains/account/domain/ports/ui/create-account-ui.port.ts

export interface AccountPort {
  navigateToApp(): Promise<void>;
  clickButton(buttonName: string): Promise<void>;
  fillAccountForm(data: {
    accountName: string;
    accountType: string;
    initialBalance: number;
    currency: string;
    description?: string;
  }): Promise<void>;
  submitForm(): Promise<void>;
  isAccountListed(accountName: string, balance: string): Promise<boolean>;
  verifyAccountCreationSuccess(): Promise<boolean>;
  verifyTotalBalanceUpdated(): Promise<string | null>;
  verifyConflictError(): Promise<string | null>;
  verifyValidationErrors(): Promise<string | null>;
  isOnFormPage(): Promise<boolean>;
  trySubmitInvalidForm(data: {
    accountName?: string;
    accountType?: string;
    initialBalance?: number;
    currency?: string;
    description?: string;
  }): Promise<string | null>;
  deleteAccount(accountName: string): Promise<boolean>;
  getLastCreatedAccountId(): Promise<string | null>;
}
