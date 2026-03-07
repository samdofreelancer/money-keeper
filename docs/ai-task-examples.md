AI Task Examples

Purpose

This document provides example tasks that demonstrate how features should be implemented in the Money Keeper project.

AI agents can use these examples to understand typical implementation patterns used in this repository.

These examples illustrate how different layers interact.

---

Example 1: Create Account Feature

Feature File

tests/features/create-account.feature

Example scenario:

Feature: Create Account

Scenario: User creates a new account
Given the user is on the account page
When the user creates a new account
Then the account should appear in the account list

---

Step Definition

Location:

tests/domains/accounts/steps/account.steps.ts

Example:

When("the user creates a new account", async function () {
await accountUseCase.createAccount("Savings Account")
})

Responsibilities:

- map Gherkin step to use case
- keep logic minimal
- delegate workflow to use case

---

Use Case

Location:

tests/domains/accounts/usecases/accountUseCase.ts

Example structure:

createAccount(name)

Steps:

1. open account page
2. fill account form
3. submit form

Responsibilities:

- orchestrate workflow
- reuse page objects
- represent business action

---

Page Object

Location:

tests/domains/accounts/pages/accountPage.ts

Responsibilities:

- store selectors
- interact with UI
- use Playwright APIs

Example actions:

fillAccountName(name)

clickCreateAccount()

getAccountList()

---

Example 2: Delete Account Feature

Feature

tests/features/delete-account.feature

Scenario:

Given the user has an existing account
When the user deletes the account
Then the account should no longer appear in the account list

---

Implementation Pattern

Step definition calls use case:

deleteAccountUseCase.deleteAccount(accountName)

Use case coordinates workflow:

1. open account page
2. locate account
3. click delete
4. confirm deletion

Page object performs UI actions.

---

General Implementation Pattern

All features should follow this pattern:

Feature
→ Step Definition
→ Use Case
→ Page Object
→ Playwright interaction

---

Key Principles

Step definitions should remain thin.

Use cases represent business workflows.

Page objects contain UI logic.

Playwright code should only appear inside page objects.

---

Guidance for AI Agents

When implementing new automation tests:

1. Start from the feature file.
2. Implement step definitions.
3. Delegate workflows to use cases.
4. Implement UI interactions in page objects.
5. Keep layers separated according to architecture.