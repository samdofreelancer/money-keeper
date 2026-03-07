# Test Data Documentation

## Purpose

Test data builders create valid, reusable test data without hard-coding values in tests.

**Benefits:**
- ✅ Defaults for common scenarios
- ✅ Fluent API for customization
- ✅ Centralized data management
- ✅ Easy to update formats
- ✅ Type-safe with TypeScript

## Builder Pattern

### Basic Builder

```typescript
const account = new AccountBuilder()
  .withName('My Savings')
  .withBalance(1_000_000)
  .withCurrency('USD')
  .build();
```

### With Defaults

```typescript
// Uses all defaults
const account = new AccountBuilder().build();
// Result: { name: 'Account-1707...', currency: 'USD', initialBalance: 0 }

// Override specific fields
const account = new AccountBuilder()
  .withBalance(5_000_000)
  .build();
// Result: { name: 'Account-1707...', currency: 'USD', initialBalance: 5_000_000 }
```

### Convenience Methods

```typescript
// Static convenience methods for common patterns
const account = AccountBuilder.withBalance(1_000_000).build();
const account = AccountBuilder.named('My Account').build();
const account = AccountBuilder.inCurrency('EUR').build();
```

### Predefined Test Accounts

```typescript
// Import predefined accounts
import { TestAccounts } from '@/test-data/account.builder';

const savings = TestAccounts.savings;
// { name: 'My Savings', currency: 'USD', initialBalance: 1_000_000 }

const checking = TestAccounts.checking;
// { name: 'Checking Account', currency: 'USD', initialBalance: 100_000 }
```

## Usage Patterns

### Single Account

```typescript
test('should create account', async ({ accountPage }) => {
  const account = new AccountBuilder()
    .withName('Test Account')
    .withBalance(1_000_000)
    .build();

  await createAccount(accountPage, account);
  await expectAccountBalance(accountPage, account.name, 1_000_000);
});
```

### Multiple Accounts

```typescript
test('should display multiple accounts', async ({ accountPage }) => {
  const accounts = [
    new AccountBuilder().withName('Savings').withBalance(5_000_000).build(),
    new AccountBuilder().withName('Checking').withBalance(500_000).build(),
    new AccountBuilder().withName('Euro').withBalance(300_000).withCurrency('EUR').build(),
  ];

  for (const account of accounts) {
    await createAccount(accountPage, account);
  }

  for (const account of accounts) {
    await expectAccountExists(accountPage, account.name);
  }
});
```

### Variations on Theme

```typescript
test('should handle different currencies', async ({ accountPage }) => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

  for (const currency of currencies) {
    const account = new AccountBuilder()
      .withName(`Account-${currency}`)
      .withCurrency(currency)
      .withBalance(1_000_000)
      .build();

    await createAccount(accountPage, account);
  }
});
```

### With Partial Updates

```typescript
test('should preserve data on update', async ({ accountPage }) => {
  const original = new AccountBuilder()
    .withName('Original')
    .withBalance(2_000_000)
    .withCurrency('EUR')
    .build();

  await createAccount(accountPage, original);

  // Update only name, keep other data
  await updateAccount(accountPage, original.name, {
    name: 'Updated Name'
  });

  await expectAccountBalance(accountPage, 'Updated Name', 2_000_000);
});
```

## Extending Test Data

### Add Currency Options

If frontend adds more currencies:

```typescript
// In account.builder.ts
export const TestAccounts = {
  savings: { /* ... */ },
  checking: { /* ... */ },
  cryptoWallet: {
    name: 'Bitcoin Wallet',
    currency: 'BTC',
    initialBalance: 0.5,
  },
  goldAccount: {
    name: 'Gold Holdings',
    currency: 'XAU',
    initialBalance: 1_000,
  },
};
```

### Add New Account Types

```typescript
export class AccountBuilder {
  // ... existing code ...

  /**
   * Create a business account with default settings
   */
  static businessAccount(): AccountData {
    return new AccountBuilder()
      .withName('Business Account')
      .withCurrency('USD')
      .withBalance(10_000_000)
      .build();
  }

  /**
   * Create personal account
   */
  static personalAccount(): AccountData {
    return new AccountBuilder()
      .withName('Personal')
      .withCurrency('USD')
      .withBalance(1_000_000)
      .build();
  }
}

// Usage
const business = AccountBuilder.businessAccount().build();
const personal = AccountBuilder.personalAccount().build();
```

### Add Validation

```typescript
export class AccountBuilder {
  build(): AccountData {
    // Validate before returning
    if (!this.data.name || this.data.name.trim() === '') {
      throw new Error('Account name is required');
    }

    if (this.data.initialBalance < 0) {
      throw new Error('Balance cannot be negative');
    }

    return { ...this.data };
  }
}
```

## Test Data Models

### Current: AccountData

```typescript
export interface AccountData {
  name: string;
  currency: string;
  initialBalance: number;
}
```

### Future: Expanded Data

When adding more features:

```typescript
export interface TransactionData {
  id?: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  date: Date;
  description?: string;
}

export class TransactionBuilder {
  // ... builder implementation ...
}
```

## Organizing Test Data Files

Keep related builders together:

```typescript
// test-data/account.builder.ts
export interface AccountData { ... }
export class AccountBuilder { ... }
export const TestAccounts = { ... }

// test-data/transaction.builder.ts
export interface TransactionData { ... }
export class TransactionBuilder { ... }

// test-data/index.ts (optional - centralized exports)
export * from './account.builder';
export * from './transaction.builder';
```

## Data Cleanup

If tests modify backend state:

```typescript
// In fixture or test teardown
test.afterEach(async ({ accountPage }) => {
  // Clean up created accounts
  await accountPage.navigateToAccounts();
  
  // Delete test accounts (those with specific naming pattern)
  // Implementation depends on app capabilities
});
```

## Good Practices

✅ **Do:**
- Use builders for all test data
- Provide sensible defaults
- Use unique identifiers (timestamps) to avoid collisions
- Document complex data structures
- Keep builders simple and focused

❌ **Don't:**
- Hard-code data in tests
- Create complex nested structures
- Put business logic in builders
- Use random data without seeds
- Forget to document special fields

## Naming Convention

| What | Example |
|---|---|
| Data Interface | `AccountData`, `TransactionData` |
| Builder Class | `AccountBuilder`, `TransactionBuilder` |
| Predefined Set | `TestAccounts`, `CommonTransactions` |
| Static Method | `AccountBuilder.withBalance()`, `AccountBuilder.businessAccount()` |

---

**Test data builders make tests readable and maintainable.**
Invest time in good builders, save time in tests.
