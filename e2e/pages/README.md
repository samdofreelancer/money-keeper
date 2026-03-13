# Page Objects Documentation

## Purpose

Page Objects encapsulate all UI interactions and element selectors for a specific page/feature.

**Rule**: Page Objects contain UI details ONLY. No business logic, no assertions, no conditionals.

## Structure Pattern

```typescript
export class SomePage {
  constructor(private page: Page) {}

  // Navigation
  async navigateTo() { ... }

  // User interactions (no assertions)
  async clickButton() { ... }
  async fillForm(data) { ... }
  async selectDropdown(value) { ... }

  // Data retrieval (for assertions to use)
  async getDisplayedText() { ... }
  async isElementVisible() { ... }

  // Wait helpers
  async waitForElement() { ... }
}
```

## Good Example

```typescript
export class AccountPage {
  async fillAccountName(name: string) {
    await this.page.fill('[data-testid="input-account-name"]', name);
  }

  async submitForm() {
    await this.page.click('[data-testid="btn-submit"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="error-message"]');
  }
}
```

## Bad Example ❌

```typescript
export class AccountPage {
  // ❌ Assertion in Page Object
  async createAccount(name: string) {
    await this.fillName(name);
    await this.submit();
    const exists = await this.page.isVisible(`[data-testid="${name}"]`);
    expect(exists).toBe(true);  // NO! This is an assertion
  }

  // ❌ Business logic
  async validateBalance() {
    const balance = await this.getBalance();
    if (balance < 0) {  // NO! Conditional logic
      throw new Error('Negative balance');
    }
  }

  // ❌ Complex logic in Page Object
  async processMultipleAccounts(accounts) {
    for (const account of accounts) {  // NO! Loop logic
      await this.createAccount(account);
    }
  }
}
```

## Selector Strategy

### ✅ Do Use `data-testid`

```typescript
// ✅ Good - stable, intentional
await this.page.click('[data-testid="btn-create"]');
await this.page.fill('[data-testid="input-name"]', 'John');
```

### ❌ Don't Use Implementation Selectors

```typescript
// ❌ Bad - brittle, depends on HTML structure
await this.page.click('div.sidebar button:first-child');
await this.page.fill('form div:nth-child(2) input', 'John');
```

### Frontend Requirements

Frontend developers must add `data-testid` to all interactive elements:

```html
<!-- Account creation form -->
<form>
  <input data-testid="input-account-name" />
  <select data-testid="select-currency">
    <option data-testid="currency-option-USD">USD</option>
  </select>
  <button data-testid="btn-create-account">Create</button>
</form>

<!-- Account list -->
<table data-testid="account-table">
  <tr data-testid="account-row-{{ accountName }}">
    <td data-testid="account-balance-{{ accountName }}">Amount</td>
    <button data-testid="btn-delete-{{ accountName }}">Delete</button>
  </tr>
</table>
```

## Method Naming Convention

- `navigate*()` - Navigation
- `get*()` - Retrieve data/element
- `fill*()` - Input data
- `click*()` - Click buttons
- `select*()` - Choose from dropdown
- `submit*()` - Submit form
- `open*()` - Open dialog/menu
- `close*()` - Close dialog/menu
- `waitFor*()` - Wait for element

## Common Patterns

### Navigation

```typescript
async navigateToAccounts() {
  await this.page.goto('/accounts');
}

async openAccountDetails(accountId: string) {
  await this.page.click(`[data-testid="account-link-${accountId}"]`);
}
```

### Form Interactions

```typescript
async fillLoginForm(username: string, password: string) {
  await this.page.fill('[data-testid="input-username"]', username);
  await this.page.fill('[data-testid="input-password"]', password);
}

async submitForm() {
  await this.page.click('[data-testid="btn-submit"]');
}
```

### Data Retrieval (For Assertions)

```typescript
async getAccountBalance(name: string) {
  return await this.page.textContent(
    `[data-testid="balance-${name}"]`
  );
}

async isAccountVisible(name: string) {
  return await this.page.isVisible(
    `[data-testid="account-${name}"]`
  );
}
```

### Dropdown Selection

```typescript
async selectCurrency(code: string) {
  await this.page.click('[data-testid="select-currency"]');
  await this.page.click(`[data-testid="currency-${code}"]`);
}
```

### Dialog/Modal Handling

```typescript
async openCreateDialog() {
  await this.page.click('[data-testid="btn-create"]');
}

async closeDialog() {
  await this.page.click('[data-testid="btn-close-dialog"]');
}

async isDialogVisible() {
  return await this.page.isVisible('[data-testid="create-dialog"]');
}
```

### Wait Helpers

```typescript
async waitForAccountToAppear(name: string) {
  await this.page.waitForSelector(
    `[data-testid="account-${name}"]`
  );
}

async waitForLoadingToComplete() {
  await this.page.waitForSelector(
    '[data-testid="loading-spinner"]',
    { state: 'hidden' }
  );
}
```

## Testing Page Objects

Page Objects themselves should NOT be unit tested. They're tested implicitly through E2E tests.

If a Page Object method fails, it means:
1. Frontend changed the selector
2. Frontend changed the behavior
3. Test infrastructure needs updating

This is intentional - we want test failures to directly reflect real changes.

## Refactoring Tips

When to split a Page Object:

- Single file > 300 lines → Split by feature
- Dialog handling gets complex → Create separate DialogPage
- Multiple independent sections → Create separate page objects

Example split:

```typescript
// ✅ Good - focused responsibility
export class AccountListPage { ... }
export class AccountFormPage { ... }
export class AccountDeleteDialogPage { ... }
```

```typescript
// ❌ Too broad
export class AccountPage { ... }  // Handles everything
```

## Collaboration with Frontend

### What QA Needs from Frontend

1. **Semantic `data-testid` attributes**
   ```html
   <!-- Good naming -->
   data-testid="btn-create-account"
   data-testid="input-account-name"
   data-testid="error-message"
   
   <!-- Not descriptive enough -->
   data-testid="btn-1"
   data-testid="input"
   data-testid="msg"
   ```

2. **Consistent naming patterns**
   ```
   [data-testid="<component>-<action>-<target>"]
   
   Examples:
   btn-create-account
   input-account-name
   select-currency
   account-row-{name}
   error-duplicate-name
   ```

3. **Elements for every interactive component**
   - All buttons
   - All form inputs
   - All dropdowns
   - All dialogs
   - All error messages
   - All dynamic content

### What Frontend Gets

- Stable tests that don't change when CSS/styling changes
- Clear requirements about testable elements
- Confidence that features work as designed
- Early feedback on usability

---

**Page Objects are the bridge between tests and UI.**
Keep them thin, focused, and implementation-free.
