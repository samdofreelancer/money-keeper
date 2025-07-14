export interface AccountManagementPort {
  createAccount(data: {
    accountName: string;
    accountType: string;
    initialBalance: number;
    currency: string;
    description?: string;
  }): Promise<string>; // returns accountId

  deleteAccount(accountId: string): Promise<void>;

  verifyAccountExists(accountName: string): Promise<boolean>;

  getAccountBalance(accountId: string): Promise<number>;

  // Add other domain-specific methods as needed
}
