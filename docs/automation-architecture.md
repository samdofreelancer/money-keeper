Test Automation Architecture

Overview

The Money Keeper project uses a layered test automation architecture for end-to-end testing.

The testing stack includes:

- Playwright
- Cucumber (BDD)
- TypeScript

The goal of this architecture is to create tests that are:

- readable
- maintainable
- reusable
- aligned with business behavior

---

Automation Layers

The automation framework follows this layered structure:

Feature → Step Definition → Use Case → Page Object → Playwright

Each layer has a specific responsibility.

---

Feature Files

Feature files describe user behavior using Gherkin syntax.

Example:

Given the user is on the account page
When the user creates a new account
Then the account should appear in the account list

Responsibilities:

- describe business scenarios
- remain readable by non-developers
- avoid technical implementation details

Feature files should focus on behavior rather than UI mechanics.

---

Step Definitions

Step definitions map Gherkin steps to executable code.

Example:

When("the user creates a new account", async function () {
await accountUseCase.createAccount(...)
})

Responsibilities:

- map Gherkin steps to actions
- remain thin and readable
- delegate work to Use Cases

Rules:

- Step definitions should NOT contain Playwright logic
- Step definitions should NOT contain complex workflows
- Steps should delegate actions to Use Cases

---

Use Cases

Use cases encapsulate reusable business workflows.

Example:

createAccount
transferMoney
deleteAccount

Responsibilities:

- coordinate interactions across multiple pages
- implement reusable test workflows
- keep business actions centralized

Example flow:

createAccount()

openAccountPage()
fillAccountForm()
submitForm()

Use cases can call multiple page objects.

---

Page Objects

Page objects encapsulate UI structure and browser interactions.

Example:

AccountPage
TransactionPage

Responsibilities:

- store UI selectors
- implement Playwright interactions
- isolate UI changes from test logic

Example responsibilities:

- click buttons
- fill forms
- read UI data

Example:

async createAccount(name)
async deleteAccount(name)

---

Playwright Layer

Playwright is responsible for browser automation.

Playwright APIs should only be used inside Page Objects.

Example responsibilities:

- clicking elements
- filling inputs
- navigating pages
- waiting for UI changes

Rules:

- Playwright should NOT be used directly in step definitions
- Playwright should be encapsulated inside page objects

---

Test Code Structure

Example structure:

tests/
domains/
accounts/
pages/
steps/
types/
usecases/

shared/
config/
utilities/

features/

Responsibilities:

pages/
UI interaction logic

steps/
step definitions for BDD

usecases/
reusable test workflows

types/
shared types and interfaces

shared/
cross-domain utilities

features/
BDD scenarios

---

Design Principles

The test automation framework follows these principles:

Separation of concerns
Each layer has a clear responsibility.

Reusability
Use cases should encapsulate reusable workflows.

Maintainability
UI changes should only affect page objects.

Readability
Feature files should remain understandable by humans.

---

Guidelines for AI Agents

When implementing or modifying tests:

1. Start from feature files.
2. Implement missing step definitions.
3. Implement business workflows in use cases.
4. Implement UI interactions inside page objects.
5. Avoid placing Playwright code in step definitions.

AI agents should follow this structure when generating new test code.