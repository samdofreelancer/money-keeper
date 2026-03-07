# Assertions Documentation

## Purpose

Assertions verify **business outcomes**. They check that the application behaves correctly according to requirements.

**Rule**: Assertions focus on WHAT changed (business results), not HOW (UI mechanics).

## Characteristics

- ✅ Named as business expectations (expectAccountExists, expectBalanceUpdated)
- ✅ Use Page Objects only for data retrieval
- ✅ Contain actual `expect()` calls
- ✅ No conditional logic
- ✅ Reusable across tests
- ✅ Clear failure messages

## Structure Pattern

```typescript
// assertions/expectSomething.ts

/**
 * Assertion: [Verify what the user expects to see]
 * 
 * Checks that a specific business outcome has occurred.
 * Uses Page Object data retrieval, adds business logic,
 * and verifies with Playwright expect().
 * 
 * Usage:
 *   await expectSomething(page, parameters);
 */
export async function expectSomething(
  page: SomePage,
  expectedValue: SomeType
) {
  // 1. Get data from Page Object
  const actual = await page.getSomeData();

  // 2. Optional: transform/parse if needed
  const parsed = transformData(actual);

  // 3. Verify with Playwright expect()
  expect(parsed).toBe(expectedValue);
}
```

## Good Examples

### Account Exists

```typescript
/**
 * Assertion: Account exists in list
 * 
 * Verifies that an account is visible in the account table
 * and can be found by the user.
 */
export async function expectAccountExists(
  accountPage: AccountPage,
  accountName: string
) {
  // Wait for element to appear (good practice)
  await accountPage.waitForAccountToAppear(accountName);

  // Get the element
  const row = accountPage.getAccountRow(accountName);

  // Verify it's visible
  await expect(row).toBeVisible();
}
```

### Account Balance

```typescript
/**
 * Assertion: Account shows correct balance
 * 
 * The tricky part: balance might be displayed as "1,000,000" or "1.000.000"
 * We need to parse the format and compare the numeric value.
 */
export async function expectAccountBalance(
  accountPage: AccountPage,
  accountName: string,
  expectedBalance: number
) {
  // Get displayed text
  const balanceText = await accountPage.getAccountBalance(accountName);

  // Parse from display format (remove commas, dots used as thousands separator)
  const parseBalance = (text: string | null): number => {
    if (!text) return 0;
    const cleaned = text.replace(/[^\d.,\-]/g, '').trim();
    const normalized = cleaned.replace(/[.,]/g, '');
    return parseInt(normalized, 10);
  };

  // Compare numbers
  const actual = parseBalance(balanceText);
  expect(actual).toBe(expectedBalance);
}
```

### Account Deleted

```typescript
/**
 * Assertion: Account no longer exists
 * 
 * Opposite of expectAccountExists - verify removal.
 */
export async function expectAccountNotExists(
  accountPage: AccountPage,
  accountName: string
) {
  // Wait for disappearance (good practice)
  await accountPage.waitForAccountToDisappear(accountName);

  // Get element
  const row = accountPage.getAccountRow(accountName);

  // Verify it's hidden
  await expect(row).not.toBeVisible();
}
```

### Error Condition

```typescript
/**
 * Assertion: Error message appears
 * 
 * Verify that the system rejected an invalid operation
 * and showed appropriate error message.
 */
export async function expectAccountCreationError(
  accountPage: AccountPage,
  expectedErrorMessage: string
) {
  // Get error text
  const errorText = await accountPage.getDialogErrorMessage();

  // Verify it contains expected message
  expect(errorText).toContain(expectedErrorMessage);
}
```

## Bad Examples ❌

### ❌ Assertion with Side Effects

```typescript
export async function expectBadAssertion(accountPage: AccountPage, name: string) {
  // ❌ WRONG - This performs an action, not just verification
  await accountPage.navigateToAccounts();  // This is an action!
  
  const balance = await accountPage.getAccountBalance(name);
  expect(balance).toBe(1_000_000);
}
```

**Fix**: Separate action from assertion
```typescript
// In test:
await createAccount(accountPage, account);  // Action
await expectAccountBalance(accountPage, account.name, 1_000_000);  // Assertion
```

### ❌ Complex Business Logic in Assertion

```typescript
export async function expectBadLogic(accountPage: AccountPage, accounts: string[]) {
  // ❌ WRONG - Complex logic in assertion
  let totalBalance = 0;
  for (const account of accounts) {
    const balance = await accountPage.getAccountBalance(account);
    const parsed = parseFloat(balance.replace(/,/g, ''));
    totalBalance += parsed;

    if (totalBalance > 10_000_000) {  // ❌ Conditional
      expect(totalBalance).toBeGreaterThan(10_000_000);
      break;
    }
  }
}
```

**Fix**: Either add helper assertion or move logic to test
```typescript
// Option 1: Dedicated assertion with clear intent
export async function expectTotalBalanceAboveThreshold(
  accountPage: AccountPage,
  accounts: string[],
  threshold: number
) {
  let total = 0;
  for (const account of accounts) {
    const balance = parseBalance(
      await accountPage.getAccountBalance(account)
    );
    total += balance;
  }
  expect(total).toBeGreaterThan(threshold);
}

// Option 2: Test handles the logic
test('total balance should exceed threshold', async ({ accountPage }) => {
  const accounts = ['Savings', 'Checking'];
  let total = 0;

  for (const account of accounts) {
    await expectAccountExists(accountPage, account);
    const balance = parseBalance(
      await accountPage.getAccountBalance(account)
    );
    total += balance;
  }

  expect(total).toBeGreaterThan(10_000_000);
});
```

### ❌ Assertion with Multiple Concerns

```typescript
export async function expectBadCombined(accountPage: AccountPage, name: string) {
  // ❌ Checks multiple things at once
  const row = accountPage.getAccountRow(name);
  await expect(row).toBeVisible();

  const balance = await accountPage.getAccountBalance(name);
  expect(balance).toContain('1,000,000');

  const currency = await accountPage.getAccountCurrency(name);
  expect(currency).toBe('USD');
}
```

**Fix**: Separate assertions
```typescript
// ✅ Use focused assertions
await expectAccountExists(accountPage, name);
await expectAccountBalance(accountPage, name, 1_000_000);
await expectAccountCurrency(accountPage, name, 'USD');
```

## Naming Convention

| What to Verify | Assertion Name |
|---|---|
| Element visible | `expectElementVisible()` |
| Entity exists | `expectAccountExists()` |
| Entity gone | `expectAccountNotExists()` |
| Value correct | `expectAccountBalance()` |
| Error shown | `expectErrorMessage()` |
| URL changed | `expectUrlContains()` |
| Disabled state | `expectButtonDisabled()` |

Pattern: `expect[Noun][Verb/State]`

## Data Transformation in Assertions

Often you need to parse displayed data to compare with expected values:

```typescript
// Example: Currency formatting
export async function expectFormattedBalance(
  accountPage: AccountPage,
  accountName: string,
  expectedBalance: number
) {
  const displayed = await accountPage.getAccountBalance(accountName);

  // Parse from "1,234,567.89" format
  const parseBalance = (text: string): number => {
    return parseFloat(
      text
        .replace(/[^\d.\-]/g, '')  // Keep only digits, dot, minus
        .trim()
    );
  };

  expect(parseBalance(displayed)).toBe(expectedBalance);
}

// Example: Date formatting
export async function expectTransactionDate(
  transactionPage: TransactionPage,
  id: string,
  expectedDate: Date
) {
  const displayed = await transactionPage.getTransactionDate(id);

  // Parse from "Feb 7, 2024" format
  const parseDate = (text: string): Date => {
    return new Date(text);
  };

  const actual = parseDate(displayed);
  expect(actual.toDateString()).toBe(expectedDate.toDateString());
}
```

## Assertion Patterns

### Visibility Assertions

```typescript
export async function expectElementVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

export async function expectElementHidden(page: Page, selector: string) {
  await expect(page.locator(selector)).not.toBeVisible();
}

export async function expectElementPresent(page: Page, selector: string) {
  await expect(page.locator(selector)).toHaveCount(1);
}

export async function expectElementsCount(page: Page, selector: string, count: number) {
  await expect(page.locator(selector)).toHaveCount(count);
}
```

### State Assertions

```typescript
export async function expectButtonEnabled(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeEnabled();
}

export async function expectButtonDisabled(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeDisabled();
}

export async function expectFieldHasValue(
  page: Page,
  selector: string,
  value: string
) {
  await expect(page.locator(selector)).toHaveValue(value);
}

export async function expectFieldHasText(
  page: Page,
  selector: string,
  text: string
) {
  await expect(page.locator(selector)).toHaveText(text);
}
```

### Content Assertions

```typescript
export async function expectTextContains(
  page: Page,
  selector: string,
  text: string
) {
  await expect(page.locator(selector)).toContainText(text);
}

export async function expectTextEquals(
  page: Page,
  selector: string,
  text: string
) {
  const actual = await page.textContent(selector);
  expect(actual?.trim()).toBe(text);
}
```

## Assertions in Tests

### Simple Verification
```typescript
test('should create account', async ({ accountPage }) => {
  const account = AccountBuilder.withBalance(1_000_000).build();

  await createAccount(accountPage, account);

  await expectAccountExists(accountPage, account.name);
});
```

### Multiple Assertions
```typescript
test('should create account with all details', async ({ accountPage }) => {
  const account = new AccountBuilder()
    .withName('Test')
    .withBalance(1_000_000)
    .withCurrency('EUR')
    .build();

  await createAccount(accountPage, account);

  // Multiple focused assertions
  await expectAccountExists(accountPage, account.name);
  await expectAccountBalance(accountPage, account.name, 1_000_000);
  await expectAccountCurrency(accountPage, account.name, 'EUR');
});
```

### Negative Assertions
```typescript
test('should remove account after deletion', async ({ accountPage }) => {
  const account = TestAccounts.savings;
  await createAccount(accountPage, account);

  // Act
  await deleteAccount(accountPage, account.name);

  // Assert - account is gone
  await expectAccountNotExists(accountPage, account.name);
});
```

### Error Case Assertions
```typescript
test('should show error for duplicate account name', async ({ accountPage }) => {
  const account = TestAccounts.savings;
  await createAccount(accountPage, account);

  // Try to create again
  await accountPage.openCreateAccountDialog();
  await accountPage.fillAccountName(account.name);
  await accountPage.selectCurrency(account.currency);
  await accountPage.fillInitialBalance(100_000);
  await accountPage.submitCreateAccount();

  // Assert error appears
  await expectAccountCreationError(accountPage, 'already exists');
});
```

## Building Reusable Assertions

Start specific, generalize when pattern emerges:

```typescript
// v1: Task-specific
export async function expectAccountBalanceIs1M(accountPage: AccountPage, name: string) {
  const balance = await accountPage.getAccountBalance(name);
  expect(parseInt(balance)).toBe(1_000_000);
}

// v2: Still specific to accounts but parameterized
export async function expectAccountBalance(
  accountPage: AccountPage,
  name: string,
  expectedBalance: number
) {
  const balance = await accountPage.getAccountBalance(name);
  expect(parseInt(balance)).toBe(expectedBalance);
}

// v3: Generic for any numeric field (but still clear business meaning)
export async function expectNumericFieldValue(
  page: Page,
  testId: string,
  expectedValue: number
) {
  const text = await page.textContent(`[data-testid="${testId}"]`);
  expect(parseInt(text || '0')).toBe(expectedValue);
}
```

Start with v2 - specific enough to be meaningful, general enough to reuse.

## Checklist for New Assertions

- [ ] Named as business expectation (expect + Noun + Verb/State)
- [ ] Documented with JSDoc and usage example
- [ ] Only retrieves data from Page Objects
- [ ] Contains actual `expect()` calls
- [ ] No business logic or conditionals
- [ ] No side effects (doesn't navigate or interact)
- [ ] Clear failure message (Playwright provides this)
- [ ] Reusable across tests
- [ ] Handles data parsing/formatting as needed

---

**Assertions verify the business value.**
Make them specific to what matters, general enough to reuse.
