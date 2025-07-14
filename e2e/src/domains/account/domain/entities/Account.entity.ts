export type AccountType =
  | "Bank Account"
  | "Credit Card"
  | "Cash"
  | "Investment";

export class Account {
  public readonly accountName: string;
  public readonly accountType: AccountType;
  public readonly initialBalance: number;
  public readonly currency: string;
  public readonly description?: string;

  private static validAccountTypes: AccountType[] = [
    "Bank Account",
    "Credit Card",
    "Cash",
    "Investment",
  ];

  constructor(params: {
    _accountName: string;
    accountType: string;
    initialBalance: number;
    currency: string;
    description?: string;
  }) {
    const {
      _accountName: accountName,
      accountType,
      initialBalance,
      currency,
      description,
    } = params;

    if (
      !accountName ||
      typeof accountName !== "string" ||
      accountName.trim() === ""
    ) {
      throw new Error("Account name must be a non-empty string");
    }

    if (!Account.validAccountTypes.includes(accountType as AccountType)) {
      throw new Error(`Invalid account type: ${accountType}`);
    }

    if (
      initialBalance === undefined ||
      initialBalance === null ||
      isNaN(initialBalance) ||
      initialBalance < 0
    ) {
      throw new Error("Initial balance must be a non-negative number");
    }

    if (!currency || typeof currency !== "string" || currency.trim() === "") {
      throw new Error("Currency must be a non-empty string");
    }

    this.accountName = accountName;
    this.accountType = accountType as AccountType;
    this.initialBalance = initialBalance;
    this.currency = currency;
    this.description = description;
  }
}
