/**
 * Account Data Model
 * 
 * Represents the business data for an account.
 * Used by tests and builders, not by Page Objects.
 */
export interface AccountData {
  name: string;
  type?: string; // e.g., 'SAVINGS', 'E_WALLET'
  currency: string;
  initialBalance: number;
  description?: string;
}

/**
 * Account Builder
 * 
 * Implements Builder pattern for creating test data.
 * Provides sensible defaults and fluent API.
 * 
 * Usage:
 *   const account = new AccountBuilder()
 *     .withName('My Savings')
 *     .withBalance(1_000_000)
 *     .build();
 */
export class AccountBuilder {
  private data: AccountData;

  constructor() {
    this.data = {
      name: `Account-${Date.now()}`,
      type: 'SAVINGS',
      currency: 'USD',
      initialBalance: 0,
    };
  }

  static create() {
    return new AccountBuilder();
  }

  withName(name: string): AccountBuilder {
    this.data.name = name;
    return this;
  }

  withType(type: string): AccountBuilder {
    this.data.type = type;
    return this;
  }

  withCurrency(currency: string): AccountBuilder {
    this.data.currency = currency;
    return this;
  }

  withBalance(balance: number): AccountBuilder {
    this.data.initialBalance = balance;
    return this;
  }

  withDescription(description: string): AccountBuilder {
    this.data.description = description;
    return this;
  }

  build(): AccountData {
    return { ...this.data };
  }

  // Convenience static methods for common scenarios
  static withBalance(balance: number): AccountData {
    return new AccountBuilder().withBalance(balance).build();
  }

  static named(name: string): AccountData {
    return new AccountBuilder().withName(name).build();
  }

  static inCurrency(currency: string): AccountData {
    return new AccountBuilder().withCurrency(currency).build();
  }
}

// Predefined common accounts
export const TestAccounts = {
  savings: {
    name: 'My Savings',
    type: 'SAVINGS',
    currency: 'USD',
    initialBalance: 1_000_000,
  } as AccountData,

  checking: {
    name: 'Checking Account',
    type: 'BANK_ACCOUNT',
    currency: 'USD',
    initialBalance: 100_000,
  } as AccountData,

  euro: {
    name: 'Euro Account',
    type: 'SAVINGS',
    currency: 'EUR',
    initialBalance: 500_000,
  } as AccountData,
};
