# Playwright Script Conversion Guide

## Overview

This guide provides a comprehensive prompt template for converting raw Playwright scripts into the structured format used by the playwright-code-gen project.

## LLM Conversion Prompt

```
You are an expert test automation engineer. Convert the provided Playwright script into the playwright-code-gen project structure following these strict guidelines:

### Project Structure Mapping

1. **Feature Files** (`src/features/[domain]/`)
   - Convert test scenarios into Gherkin `.feature` files
   - Use business-readable language
   - Structure: `Given-When-Then` format

2. **Page Objects** (`src/domains/[domain]/pages/`)
   - Create Playwright page classes extending BasePage
   - File naming: `[entity].playwright.page.ts`
   - Include selectors, actions, and assertions

3. **Step Definitions** (`src/domains/[domain]/steps/`)
   - Map Gherkin steps to Playwright actions
   - File naming: `[entity].steps.ts`
   - Use dependency injection for page objects

4. **Use Cases** (`src/domains/[domain]/usecases/`)
   - Encapsulate business logic
   - File naming: `[entity].use-case.ts`
   - Separate concerns: navigation, validation, CRUD operations

5. **Types** (`src/domains/[domain]/types/`)
   - Define DTOs and interfaces
   - File naming: `[entity].dto.ts`

### Current Project Structure

```

playwright-code-gen/
├── src/
│ ├── domains/
│ │ └── accounts/
│ │ ├── api/ # API clients
│ │ ├── pages/ # Page objects
│ │ ├── steps/ # Step definitions
│ │ ├── types/ # DTOs and interfaces
│ │ └── usecases/ # Business logic
│ ├── features/
│ │ └── accounts/
│ │ ├── account-creation.feature
│ │ └── readme.md
│ └── shared/
│ ├── utilities/
│ └── types/
├── cucumber.js # Cucumber configuration
└── package.json # Dependencies

````

### Conversion Rules

#### From Playwright Script → Project Structure

**Raw Playwright Code:**
```typescript
test('create account', async ({ page }) => {
  await page.goto('/accounts');
  await page.fill('#account-name', 'Test Account');
  await page.click('#save-button');
  await expect(page.locator('.success-message')).toBeVisible();
});
````

**Converted Structure:**

1. **Feature File** (`src/features/accounts/account-creation.feature`):

```gherkin
Feature: Account Creation

  Scenario: Create a new account
    Given I am on the accounts page
    When I create a new account with name "Test Account"
    Then I should see a success message
```

2. **Page Object** (`src/domains/accounts/pages/accounts.playwright.page.ts`):

```typescript
import { BasePage } from '../../shared/utilities/base-page';

export class AccountsPage extends BasePage {
  private readonly accountNameInput = '#account-name';
  private readonly saveButton = '#save-button';
  private readonly successMessage = '.success-message';

  async navigate(): Promise<void> {
    await this.page.goto('/accounts');
  }

  async createAccount(accountName: string): Promise<void> {
    await this.fill(this.accountNameInput, accountName);
    await this.click(this.saveButton);
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.successMessage);
  }
}
```

3. **Step Definitions** (`src/domains/accounts/steps/account.steps.ts`):

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AccountsPage } from '../pages/accounts.playwright.page';

Given('I am on the accounts page', async function () {
  const accountsPage = new AccountsPage(this.page);
  await accountsPage.navigate();
});

When(
  'I create a new account with name {string}',
  async function (accountName: string) {
    const accountsPage = new AccountsPage(this.page);
    await accountsPage.createAccount(accountName);
  }
);

Then('I should see a success message', async function () {
  const accountsPage = new AccountsPage(this.page);
  expect(await accountsPage.isSuccessMessageVisible()).toBe(true);
});
```

4. **Use Case** (`src/domains/accounts/usecases/account.use-case.ts`):

```typescript
import { AccountDTO } from '../types/account.dto';

export class AccountUseCase {
  async createAccount(accountData: AccountDTO): Promise<void> {
    // Business logic implementation
  }
}
```

5. **Types** (`src/domains/accounts/types/account.dto.ts`):

```typescript
export interface AccountDTO {
  name: string;
  type?: string;
  balance?: number;
}
```

### File Organization Pattern

```
src/
├── domains/
│   └── [domain-name]/
│       ├── api/                    # API clients
│       │   └── [entity]-api.client.ts
│       ├── pages/                  # Page objects
│       │   └── [entity].playwright.page.ts
│       ├── steps/                  # Step definitions
│       │   └── [entity].steps.ts
│       ├── types/                  # DTOs and interfaces
│       │   └── [entity].dto.ts
│       └── usecases/               # Business logic
│           └── [entity].use-case.ts
├── features/
│   └── [domain-name]/
│       ├── [feature].feature
│       └── readme.md
└── shared/
    ├── utilities/
    │   ├── base-page.ts
    │   └── world.ts
    └── types/
```

### Naming Conventions

- **Files**: kebab-case with descriptive names
- **Classes**: PascalCase (e.g., `AccountsPage`, `AccountUseCase`)
- **Methods**: camelCase (e.g., `createAccount`, `isVisible`)
- **Selectors**: Use data-testid attributes when possible
- **Variables**: camelCase with descriptive names

### Code Standards

1. **Type Safety**: Use TypeScript for all files
2. **Async/Await**: Always use async/await for Playwright operations
3. **Error Handling**: Include proper error handling and assertions
4. **Page Object Model**: Follow POM design pattern strictly
5. **Single Responsibility**: Each class/method should have one responsibility

### Conversion Checklist

- [ ] Extract test scenarios into Gherkin features
- [ ] Create page objects for each screen/section
- [ ] Implement step definitions for each Gherkin step
- [ ] Create use cases for business logic
- [ ] Define DTOs for data structures
- [ ] Add proper TypeScript types
- [ ] Include error handling
- [ ] Add meaningful assertions
- [ ] Follow naming conventions
- [ ] Ensure code is reusable and maintainable

### Example Conversion Flow

1. **Analyze** the raw Playwright script
2. **Identify** test scenarios and user journeys
3. **Create** corresponding Gherkin features
4. **Design** page objects based on UI interactions
5. **Implement** step definitions
6. **Create** use cases for business logic
7. **Add** TypeScript types and interfaces
8. **Validate** the complete flow

### Common Patterns

#### Navigation

```typescript
// Raw
await page.goto('/accounts');

// Converted
// In page object
async navigate(): Promise<void> {
  await this.page.goto('/accounts');
}
```

#### Form Interaction

```typescript
// Raw
await page.fill('#name', 'value');

// Converted
// In page object
async fillName(value: string): Promise<void> {
  await this.fill(this.nameInput, value);
}
```

#### Assertions

```typescript
// Raw
await expect(page.locator('.message')).toHaveText('Success');

// Converted
// In step definition
expect(await this.pageObject.getMessageText()).toBe('Success');
```

### Usage Instructions

1. **Copy the prompt** above into your LLM interface
2. **Provide the raw Playwright script** you want to
