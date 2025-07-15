// e2e/src/domains/account/domain/value-objects/account-form-data.vo.ts

import { logger } from "../../../../shared";

export interface AccountFormData {
  readonly accountName: string;
  readonly accountType: string;
  readonly initialBalance: number;
  readonly currency: string;
  readonly description: string;
}

export interface RawFormInput {
  [key: string]: unknown;
}

/**
 * Value Object for Account Form Data
 * Encapsulates validation and normalization logic according to DDD principles
 */
export class AccountFormValue {
  private readonly _data: AccountFormData;

  private constructor(data: AccountFormData) {
    this._data = Object.freeze(data);
  }

  /**
   * Factory method to create AccountFormValue from raw form input
   * Handles normalization and validation
   */
  static fromRawInput(input: RawFormInput): AccountFormValue {
    const normalized = AccountFormValue.normalizeInput(input);
    AccountFormValue.validateInput(normalized);

    return new AccountFormValue(normalized);
  }

  /**
   * Factory method for test data creation
   */
  static create(data: Partial<AccountFormData>): AccountFormValue {
    const defaults: AccountFormData = {
      accountName: "",
      accountType: "BANK_ACCOUNT",
      initialBalance: 0,
      currency: "USD",
      description: "",
    };

    const merged = { ...defaults, ...data };
    AccountFormValue.validateInput(merged);

    return new AccountFormValue(merged);
  }

  // Getters for accessing normalized data
  get accountName(): string {
    return this._data.accountName;
  }
  get accountType(): string {
    return this._data.accountType;
  }
  get initialBalance(): number {
    return this._data.initialBalance;
  }
  get currency(): string {
    return this._data.currency;
  }
  get description(): string {
    return this._data.description;
  }

  /**
   * Convert to plain object for external APIs
   */
  toPlainObject(): AccountFormData {
    return { ...this._data };
  }

  /**
   * Normalize various input formats to consistent camelCase structure
   */
  private static normalizeInput(input: RawFormInput): AccountFormData {
    return {
      accountName:
        AccountFormValue.extractField(input, [
          "accountName",
          "Account Name",
          "AccountName",
        ]) || "",

      accountType:
        AccountFormValue.normalizeAccountType(
          AccountFormValue.extractField(input, [
            "accountType",
            "Account Type",
            "AccountType",
          ]) || "BANK_ACCOUNT"
        ),

      initialBalance:
        AccountFormValue.extractNumericField(input, [
          "initialBalance",
          "Initial Balance",
          "InitialBalance",
        ]) || 0,

      currency:
        AccountFormValue.extractField(input, ["currency", "Currency"]) || "USD",

      description:
        AccountFormValue.extractField(input, ["description", "Description"]) ||
        "",
    };
  }

  /**
   * Normalize account type from user-friendly format to internal format
   */
  private static normalizeAccountType(accountType: string): string {
    const accountTypeMap: { [key: string]: string } = {
      "Bank Account": "BANK_ACCOUNT",
      "Savings Account": "SAVINGS_ACCOUNT", 
      "Credit Account": "CREDIT_ACCOUNT",
      "Investment Account": "INVESTMENT_ACCOUNT",
      "BANK_ACCOUNT": "BANK_ACCOUNT",
      "SAVINGS_ACCOUNT": "SAVINGS_ACCOUNT",
      "CREDIT_ACCOUNT": "CREDIT_ACCOUNT", 
      "INVESTMENT_ACCOUNT": "INVESTMENT_ACCOUNT",
    };
    
    return accountTypeMap[accountType] || accountType;
  }

  /**
   * Extract field value trying multiple possible keys
   */
  private static extractField(
    input: RawFormInput,
    keys: string[]
  ): string | undefined {
    for (const key of keys) {
      const value = input[key];
      if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
    return undefined;
  }

  /**
   * Extract numeric field value trying multiple possible keys
   */
  private static extractNumericField(
    input: RawFormInput,
    keys: string[]
  ): number | undefined {
    for (const key of keys) {
      const value = input[key];
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  }

  /**
   * Validate business rules and invariants
   */
  private static validateInput(data: AccountFormData): void {
    const errors: string[] = [];

    // Account name is required and must be meaningful
    if (!data.accountName || data.accountName.trim().length === 0) {
      errors.push("Account name is required");
    } else if (data.accountName.trim().length < 2) {
      errors.push("Account name must be at least 2 characters long");
    } else if (data.accountName.trim().length > 100) {
      errors.push("Account name must be less than 100 characters");
    }

    // Account type must be valid
    const validAccountTypes = [
      "BANK_ACCOUNT",
      "SAVINGS_ACCOUNT",
      "CREDIT_ACCOUNT",
      "INVESTMENT_ACCOUNT",
    ];
    logger.info(
      `Validating account type: ${data.accountType}, valid types: ${validAccountTypes.join(", ")}`
    );  
    if (!validAccountTypes.includes(data.accountType)) {
      errors.push(
        `Account type must be one of: ${validAccountTypes.join(", ")}`
      );
    }

    // Initial balance must be valid
    if (isNaN(data.initialBalance)) {
      errors.push("Initial balance must be a valid number");
    } else if (data.initialBalance < 0) {
      errors.push("Initial balance cannot be negative");
    } else if (data.initialBalance > 1000000000) {
      // 1 billion limit
      errors.push("Initial balance cannot exceed 1 billion");
    }

    // Currency must be valid ISO code
    const validCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
    if (!validCurrencies.includes(data.currency)) {
      errors.push(`Currency must be one of: ${validCurrencies.join(", ")}`);
    }

    // Description length limit
    if (data.description.length > 500) {
      errors.push("Description must be less than 500 characters");
    }

    if (errors.length > 0) {
      throw new Error(`Account form validation failed: ${errors.join(", ")}`);
    }
  }

  /**
   * Check if this value object equals another
   */
  equals(other: AccountFormValue): boolean {
    return JSON.stringify(this._data) === JSON.stringify(other._data);
  }

  /**
   * Get string representation
   */
  toString(): string {
    return `AccountFormValue(${this.accountName}, ${this.accountType}, ${this.initialBalance} ${this.currency})`;
  }
}
