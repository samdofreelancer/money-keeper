# E2E Test Fixture Documentation

## Overview

The test fixture (`test-fixture.ts`) extends Playwright's base test with application-specific context.

## What It Provides

Every test receives:
- `page` - Playwright page object
- `app` - Application context (the page)
- `accountPage` - AccountPage object
- `settingsPage` - SettingsPage object

## Usage Example

```typescript
import { test } from '@/fixtures/test-fixture';

test('should create account', async ({ accountPage, settingsPage }) => {
  // Use page objects directly
  await accountPage.navigateToAccounts();
  await settingsPage.getBaseCurrency();
});
```

## Adding New Page Objects

1. Create page object in `pages/`
2. Import in `test-fixture.ts`
3. Add to fixture type definition and extend

```typescript
// In test-fixture.ts
export type AppFixture = {
  app: Page;
  accountPage: AccountPage;
  settingsPage: SettingsPage;
  newPageObject: NewPageObject;  // Add here
};

export const test = base.extend<AppFixture>({
  newPageObject: async ({ page }, use) => {
    const obj = new NewPageObject(page);
    await use(obj);
  },
});
```

## Test Isolation

The fixture ensures each test gets a fresh page object instance, maintaining test independence.
