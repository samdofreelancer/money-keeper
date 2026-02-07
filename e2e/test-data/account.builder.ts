/**
 * Account Data Model
 *
 * Represents business data for an account.
 * Used by tests, builders, and API clients.
 * Single source of truth for account structure.
 */
export interface AccountData {
  name: string;
  type?: string; // e.g., 'E-Wallet', 'Bank Account'
  currency: string;
  initialBalance: number;
  description?: string;
}

/**
 * Account Builder
 *
 * Implements Builder pattern for creating test data.
 * Provides sensible defaults and fluent API.
 * Ensures test data is always valid.
 *
 * Usage:
 *   // Fluent API
 *   const account = new AccountBuilder()
 *     .withName('My Savings')
 *     .withBalance(1_000_000)
 *     .withCurrency('USD')
 *     .build();
 *
 *   // Static convenience methods
 *   const account = AccountBuilder.withBalance(1_000_000).build();
 *   const account = AccountBuilder.named('Quick Account').build();
 */
export class AccountBuilder {
  private data: AccountData;

  constructor() {
    this.data = {
      name: `TEST_Account_${Date.now()}`,
      type: 'E_WALLET',
      currency: 'USD',
      initialBalance: 0,
    };
  }

  /**
   * Create a new builder instance
   */
  static create(): AccountBuilder {
    return new AccountBuilder();
  }

  /**
   * Set account name
   */
  withName(name: string): AccountBuilder {
    this.data.name = name;
    return this;
  }

  /**
   * Set account type (E-Wallet, Bank Account, etc.)
   */
  withType(type: string): AccountBuilder {
    this.data.type = type;
    return this;
  }

  /**
   * Set currency code (USD, EUR, VND, etc.)
   */
  withCurrency(currency: string): AccountBuilder {
    this.data.currency = currency;
    return this;
  }

  /**
   * Set initial balance
   */
  withBalance(balance: number): AccountBuilder {
    this.data.initialBalance = balance;
    return this;
  }

  /**
   * Set account description
   */
  withDescription(description: string): AccountBuilder {
    this.data.description = description;
    return this;
  }

  /**
   * Build the account data object
   */
  build(): AccountData {
    return { ...this.data };
  }

  // ===== Static convenience methods =====

  /**
   * Create account with specific balance
   */
  static withBalance(balance: number): AccountBuilder {
    return new AccountBuilder().withBalance(balance);
  }

  /**
   * Create account with specific name
   */
  static named(name: string): AccountBuilder {
    return new AccountBuilder().withName(name);
  }

  /**
   * Create account in specific currency
   */
  static inCurrency(currency: string): AccountBuilder {
    return new AccountBuilder().withCurrency(currency);
  }
}

/**
 * Predefined common test accounts
 */
export const TestAccounts = {
  savings: {
    name: 'TEST_Savings',
    type: 'E_WALLET',
    currency: 'USD',
    initialBalance: 1_000_000,
  } as AccountData,

  checking: {
    name: 'TEST_Checking',
    type: 'BANK_ACCOUNT',
    currency: 'USD',
    initialBalance: 100_000,
  } as AccountData,

  savings_usd: {
    name: 'TEST_Savings_USD',
    type: 'E_WALLET',
    currency: 'USD',
    initialBalance: 1_000_000,
  } as AccountData,

  savings_vnd: {
    name: 'TEST_Savings_VND',
    type: 'E_WALLET',
    currency: 'VND',
    initialBalance: 25_000_000,
  } as AccountData,

  savings_eur: {
    name: 'TEST_Savings_EUR',
    type: 'E_WALLET',
    currency: 'EUR',
    initialBalance: 500_000,
  } as AccountData,

  empty: {
    name: 'TEST_Empty_Account',
    type: 'E_WALLET',
    currency: 'USD',
    initialBalance: 0,
  } as AccountData,
};
