// e2e/src/domains/account/domain/ports/ui/create-account-ui.port.ts

export interface CreateAccountUiPort {
  navigateToApp(): Promise<void>;
  fillAccountForm(data: {
    accountName: string;
    accountType: string;
    initialBalance: number;
    currency: string;
    description?: string;
  }): Promise<void>;
  submitForm(): Promise<void>;
  isAccountListed(accountName: string, balance: string): Promise<boolean>;
}
