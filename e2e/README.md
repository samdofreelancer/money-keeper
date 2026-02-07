# Money Keeper E2E Test Suite

> Clean, maintainable Playwright tests for account management features.

## Philosophy

This test suite prioritizes **business rule validation** over UI automation. Tests read like business scenarios, not technical procedures.

### Key Principles

- **Tests describe business value**: Each test tells a story about what the system should do
- **No selectors in tests**: UI implementation details are hidden in Page Objects
- **No logic in tests**: Complex logic belongs in Actions and Assertions
- **No hard-coded data**: Test data uses Builder pattern for flexibility
- **Long-term maintainability**: Code is written for a 2-3 year lifecycle with minimal resources

## Project Structure

```
e2e/
├── fixtures/              # Playwright test fixtures and test context
│   └── test-fixture.ts    # Provides page objects and helpers to tests
├── pages/                 # Page Objects - UI interactions only
│   ├── AccountPage.ts     # Account list, dialogs, forms
│   └── SettingsPage.ts    # Settings UI
├── actions/               # Business actions - "what the user does"
│   ├── createAccount.ts   # Create new account flow
│   ├── updateAccount.ts   # Update account details
│   └── deleteAccount.ts   # Delete account with confirmation
├── assertions/            # Business assertions - "what we verify"
│   ├── expectAccountExists.ts
│   ├── expectAccountBalance.ts
│   ├── expectAccountNotExists.ts
│   └── expectAccountCreationError.ts
├── test-data/             # Test data builders and models
│   └── account.builder.ts # Account data factory
└── tests/                 # Test suites
    └── account.management.spec.ts
```

## Architecture Layers

### 1. Tests (`tests/*.spec.ts`)
- Describes business scenarios
- Calls Actions and Assertions
- No page object references
- No selectors
- No conditional logic

Example:
```typescript
test('should create account with initial balance', async ({ accountPage }) => {
  const account = AccountBuilder.withBalance(1_000_000).build();
  await createAccount(accountPage, account);
  await expectAccountBalance(accountPage, account.name, 1_000_000);
});
```

### 2. Actions (`actions/*.ts`)
- Orchestrates Page Object methods
- Represents user journeys
- No assertions
- Reusable business flows

Example:
```typescript
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

### 3. Assertions (`assertions/*.ts`)
- Verify business outcomes
- No UI implementation details
- Focus on end results
- Easy to understand

Example:
```typescript
export async function expectAccountBalance(
  accountPage: AccountPage,
  accountName: string,
  expectedBalance: number
) {
  const balanceText = await accountPage.getAccountBalance(accountName);
  const actual = parseBalance(balanceText);
  expect(actual).toBe(expectedBalance);
}
```

### 4. Page Objects (`pages/*.ts`)
- Contains selectors
- Low-level UI interactions
- No assertions
- No business logic
- No conditional statements

Example:
```typescript
export class AccountPage {
  async openCreateAccountDialog() {
    await this.page.click('[data-testid="btn-create-account"]');
  }

  async fillAccountName(name: string) {
    await this.page.fill('[data-testid="input-account-name"]', name);
  }
}
```

### 5. Test Data (`test-data/*.ts`)
- Builder pattern for flexibility
- Sensible defaults
- Predefined common scenarios
- No magic strings in tests

Example:
```typescript
const account = new AccountBuilder()
  .withName('My Savings')
  .withBalance(1_000_000)
  .withCurrency('USD')
  .build();

// Or using convenience methods
const account = AccountBuilder.withBalance(1_000_000).build();
```

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run in UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Generate test code (Codegen)
npm run codegen
```

## Frontend Requirements

Tests expect the frontend to use `data-testid` attributes for element identification:

```html
<!-- Account List -->
<table data-testid="account-table">
  <tr data-testid="account-row-{{ name }}">
    <td data-testid="account-balance-{{ name }}">1,000,000</td>
    <td data-testid="account-currency-{{ name }}">USD</td>
    <button data-testid="btn-account-menu-{{ name }}">⋮</button>
  </tr>
</table>

<!-- Create Dialog -->
<input data-testid="input-account-name" />
<select data-testid="select-currency">
  <option data-testid="currency-option-USD">USD</option>
</select>
<input data-testid="input-initial-balance" />
<button data-testid="btn-submit-account">Create</button>

<!-- Error Message -->
<div data-testid="dialog-error">Error text</div>
```

## Environment Configuration

Create `.env` file in project root:

```env
BASE_URL=http://localhost:5173
```

## Features Covered

### Account Management
- ✅ Create account with name, currency, initial balance
- ✅ Prevent duplicate account names
- ✅ Update account name
- ✅ Delete account with confirmation
- ✅ Display correct balance
- ✅ Handle large balance values
- ✅ Support special characters in names
- ✅ Multiple accounts with same currency
- ✅ Account lifecycle (create → update → delete)

### Planned Features
- [ ] Account transactions
- [ ] Category management
- [ ] Exchange rate handling
- [ ] Balance calculations
- [ ] Settings management

## Best Practices

### ✅ Do

1. **Name tests as business rules**
   ```typescript
   test('should create account with initial balance', ...)
   ```

2. **Use builders for test data**
   ```typescript
   const account = AccountBuilder.withBalance(1_000_000).build();
   ```

3. **Extract common flows to actions**
   ```typescript
   await createAccount(accountPage, account);
   ```

4. **Verify business outcomes with assertions**
   ```typescript
   await expectAccountBalance(accountPage, name, 1_000_000);
   ```

5. **Use AAA pattern (Arrange, Act, Assert)**
   ```typescript
   const account = new AccountBuilder()...build();  // Arrange
   await createAccount(accountPage, account);       // Act
   await expectAccountExists(accountPage, ...);     // Assert
   ```

### ❌ Don't

1. ❌ Put selectors in tests
2. ❌ Write if/else logic in tests
3. ❌ Hard-code test data
4. ❌ Mix assertions and actions
5. ❌ Add business logic to Page Objects
6. ❌ Create deep selector paths
7. ❌ Use wait loops (use waitForSelector)
8. ❌ Over-abstract Page Objects

## Maintenance Tips

1. **Update Page Objects when UI changes** - not tests
2. **Keep tests focused** - one business rule per test
3. **Reuse actions** - don't duplicate flows
4. **Document assumptions** - especially around test data
5. **Monitor test flakiness** - indicates real issues or test design problems
6. **Review test patterns** - ensure consistency

## CI/CD Integration

Configure in your CI pipeline:

```yaml
- name: Install dependencies
  run: npm install

- name: Run E2E tests
  run: npm test

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests fail with "element not found"
- Check frontend implements required `data-testid` attributes
- Verify selectors match exactly

### Tests are flaky
- Add explicit waits in Page Objects (`.waitForSelector()`)
- Ensure test data cleanup between runs
- Check for timing issues in async operations

### Page object methods are growing
- Split into multiple page objects (e.g., `AccountDialogPage`)
- Extract dialog interactions to separate module
- Keep responsibility focused

## Contributing

When adding new tests:

1. Create test in `tests/`
2. Add new actions to `actions/` if needed
3. Add new assertions to `assertions/` if needed
4. Update Page Object selectors (never in test)
5. Use test data builders
6. Follow AAA pattern
7. Name test as business rule

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

**Built with ❤️ for sustainable test automation**
