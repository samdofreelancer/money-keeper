# Actions Documentation

## Purpose

Actions represent **business-level user journeys**. They orchestrate multiple Page Object methods to achieve a business goal.

**Rule**: Actions describe "what the user does" in terms of business processes, not clicks and keystrokes.

## Characteristics

- ✅ Named as business actions (createAccount, updateProfile, checkout)
- ✅ Composed of Page Object methods
- ✅ Can combine multiple page objects
- ✅ No assertions (that's for assertions module)
- ✅ Reusable across tests
- ✅ Documented with business context

## Structure Pattern

```typescript
// actions/someBusiness.ts

/**
 * Business Action: [What the user does]
 * 
 * Orchestrates multiple page object methods to complete a business flow.
 * Used by tests to set up preconditions or execute main scenarios.
 * 
 * Usage:
 *   await someBusinessAction(page, data);
 */
export async function someBusinessAction(
  page: SomePage,
  data: SomeData
) {
  // Step 1: Navigate/open
  await page.navigateTo();

  // Step 2: Fill data
  await page.fillForm(data);

  // Step 3: Submit/confirm
  await page.submit();

  // Step 4: Maybe wait for something
  await page.waitForSuccess();
}
```

## Good Examples

### Create Account Action

```typescript
/**
 * Business Action: Create a new account
 * 
 * User flow:
 * 1. Navigate to accounts page
 * 2. Open create dialog
 * 3. Enter account details (name, currency, balance)
 * 4. Submit form
 * 
 * Doesn't verify result - that's for assertions.
 */
export async function createAccount(
  accountPage: AccountPage,
  account: AccountData
) {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
  await accountPage.fillAccountName(account.name);
  await accountPage.selectCurrency(account.currency);
  await accountPage.fillInitialBalance(account.initialBalance);
  await accountPage.submitCreateAccount();
}
```

### Update Account Action

```typescript
export async function updateAccount(
  accountPage: AccountPage,
  oldName: string,
  updates: Partial<AccountData>
) {
  await accountPage.navigateToAccounts();
  await accountPage.openAccountMenu(oldName);
  await accountPage.clickEditAccount(oldName);

  if (updates.name) {
    await accountPage.fillAccountNameInEditDialog(updates.name);
  }

  await accountPage.submitUpdateAccount();
}
```

### Complex Flow: Transfer Money

```typescript
/**
 * Business Action: Transfer money between accounts
 * 
 * Uses multiple page objects to complete cross-account operation.
 */
export async function transferMoney(
  accountPage: AccountPage,
  from: string,
  to: string,
  amount: number
) {
  // Open source account
  await accountPage.clickAccount(from);
  await accountPage.openTransferDialog();

  // Fill transfer details
  await accountPage.fillTransferAmount(amount);
  await accountPage.selectTransferRecipient(to);

  // Submit
  await accountPage.confirmTransfer();

  // Optional: Wait for UI update
  await accountPage.waitForTransferToComplete();
}
```

## Bad Examples ❌

### ❌ Action with Assertions

```typescript
export async function createAccountBad(accountPage: AccountPage, account: AccountData) {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
  await accountPage.fillAccountName(account.name);
  await accountPage.submitCreateAccount();

  // ❌ WRONG - Assertion in action
  const row = accountPage.getAccountRow(account.name);
  expect(row).toBeVisible();
}
```

**Fix**: Use assertion module
```typescript
// In test:
await createAccount(accountPage, account);
await expectAccountExists(accountPage, account.name);  // ✅ Separate
```

### ❌ Complex Business Logic in Action

```typescript
export async function processBadAction(accountPage: AccountPage, accounts: AccountData[]) {
  // ❌ WRONG - Complex loops and conditions
  for (const account of accounts) {
    if (account.balance > 1_000_000) {
      await accountPage.selectForProcessing(account.name);
    }
  }
  
  const count = accounts.filter(a => a.balance > 1_000_000).length;
  if (count > 5) {
    await accountPage.batchProcess();
  } else {
    await accountPage.processIndividually();
  }
}
```

**Fix**: Move logic to test or test data builder
```typescript
// In test:
const largeAccounts = accounts.filter(a => a.balance > 1_000_000);

if (largeAccounts.length > 5) {
  await batchProcessAccounts(accountPage, largeAccounts);
} else {
  for (const account of largeAccounts) {
    await processAccount(accountPage, account);
  }
}
```

### ❌ Action Too Fine-Grained

```typescript
// ❌ Each tiny step is an action - too granular
export async function fillAccountName(page, name) {
  await page.fill('[data-testid="input"]', name);
}

export async function selectCurrency(page, code) {
  await page.click('[data-testid="select"]');
  await page.click(`[data-testid="option-${code}"]`);
}

export async function fillBalance(page, balance) {
  await page.fill('[data-testid="balance"]', balance);
}
```

**Fix**: Combine into business action
```typescript
// ✅ One action = one business operation
export async function createAccount(accountPage, account) {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
  await accountPage.fillAccountName(account.name);
  await accountPage.selectCurrency(account.currency);
  await accountPage.fillInitialBalance(account.initialBalance);
  await accountPage.submitCreateAccount();
}
```

## Naming Convention

| Business Goal | Action Name |
|---|---|
| User signs in | `login()` or `signIn()` |
| User creates account | `createAccount()` |
| User updates profile | `updateProfile()` |
| User deletes account | `deleteAccount()` |
| User transfers money | `transferMoney()` |
| System processes batch | `processBatchPayments()` |
| User exports report | `exportTransactionReport()` |

## Composition Levels

### Level 1: Simple Actions
Single page object, one goal:

```typescript
export async function openSettings(settingsPage: SettingsPage) {
  await settingsPage.navigateToSettings();
}
```

### Level 2: Multi-Step Actions
Sequence of page object methods:

```typescript
export async function createAccount(
  accountPage: AccountPage,
  account: AccountData
) {
  await accountPage.navigateToAccounts();
  await accountPage.openCreateAccountDialog();
  await accountPage.fillAccountName(account.name);
  await accountPage.selectCurrency(account.currency);
  await accountPage.submitCreateAccount();
}
```

### Level 3: Multi-Page Actions
Combines multiple page objects:

```typescript
export async function transferAndVerify(
  accountPage: AccountPage,
  historyPage: HistoryPage,
  from: string,
  to: string,
  amount: number
) {
  // Action on accounts page
  await accountPage.navigateToAccounts();
  await accountPage.transfer(from, to, amount);

  // Maybe navigate to history to verify
  await historyPage.navigateToHistory();
  await historyPage.filterByDateRange('today');
}
```

### Level 4: Composite Actions
Combines multiple actions:

```typescript
/**
 * Precondition action: Set up test environment
 * 
 * Used in test setup to prepare initial state.
 */
export async function setupAccountsForTesting(
  accountPage: AccountPage
) {
  // Use other actions to set up state
  const acc1 = AccountBuilder.withBalance(1_000_000).build();
  const acc2 = AccountBuilder.withBalance(500_000).build();

  await createAccount(accountPage, acc1);
  await createAccount(accountPage, acc2);

  return { acc1, acc2 };
}
```

## Usage in Tests

### Simple Test
```typescript
test('should create account', async ({ accountPage }) => {
  // Arrange
  const account = AccountBuilder.withBalance(1_000_000).build();

  // Act - using action
  await createAccount(accountPage, account);

  // Assert
  await expectAccountExists(accountPage, account.name);
});
```

### Setup Test with Action
```typescript
test('should delete account after creation', async ({ accountPage }) => {
  // Arrange - setup using action
  const account = AccountBuilder.withBalance(500_000).build();
  await createAccount(accountPage, account);

  // Act - another action
  await deleteAccount(accountPage, account.name);

  // Assert
  await expectAccountNotExists(accountPage, account.name);
});
```

### Complex Workflow
```typescript
test('should update account details', async ({ accountPage }) => {
  // Setup
  const original = AccountBuilder.named('Original').build();
  await createAccount(accountPage, original);

  // Act
  const updated = { name: 'Updated' };
  await updateAccount(accountPage, original.name, updated);

  // Assert
  await expectAccountExists(accountPage, updated.name);
  await expectAccountNotExists(accountPage, original.name);
});
```

## Best Practices

1. **One business goal per action**
   ```typescript
   // ✅ Good - one responsibility
   export async function createAccount(...) { ... }
   export async function deleteAccount(...) { ... }

   // ❌ Bad - multiple goals
   export async function manageAccount(...) { ... }
   ```

2. **Descriptive naming**
   ```typescript
   // ✅ Clear business intent
   await completeCheckout(checkoutPage, cart);

   // ❌ Vague
   await finish(page, data);
   ```

3. **Documented usage**
   ```typescript
   /**
    * Action: Transfer money between accounts
    * 
    * Usage:
    *   await transferMoney(accountPage, 'Savings', 'Checking', 100_000);
    */
   ```

4. **Reusable in tests and setup**
   ```typescript
   // In beforeEach equivalent
   const { account } = await setupTestData(accountPage);

   // In tests
   await updateAccountName(accountPage, account.name, 'New Name');
   ```

5. **No assertions**
   ```typescript
   // ✅ Action doesn't verify
   await createAccount(accountPage, account);

   // Test verifies
   await expectAccountExists(accountPage, account.name);
   ```

## Organizing Actions

Group related actions in same file:

```typescript
// actions/accountManagement.ts
export async function createAccount(...) { ... }
export async function updateAccount(...) { ... }
export async function deleteAccount(...) { ... }

// actions/transfers.ts
export async function transferMoney(...) { ... }
export async function requestTransfer(...) { ... }

// actions/settings.ts
export async function changeBaseCurrency(...) { ... }
export async function updateNotifications(...) { ... }
```

Or keep one action per file for tiny projects:

```typescript
// actions/createAccount.ts
export async function createAccount(...) { ... }
```

## Checklist for New Actions

- [ ] Named as business operation (verb + noun)
- [ ] Documented with JSDoc
- [ ] Uses only Page Object methods
- [ ] No assertions
- [ ] No conditional logic
- [ ] Reusable across tests
- [ ] Clear parameter names
- [ ] Single responsibility
- [ ] Can be used in test setup

---

**Actions bridge the gap between test intent and UI automation.**
They make tests readable and maintenance easier.
