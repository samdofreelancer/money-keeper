# cucumber playwright typescript

Using Playwright MCP please perform below steps:
1. Access page http://localhost:5173/accounts
2. Click on button "Add Account"
3. Fill in the form with the following data:
    - account name: "Test Account"
    - select account type: "Bank Account"
    - input balance: 1000
    - select current currency: US Dollar
    - input description: "Test account description"
4. Click on button "Create"
5. Verify that the account was created successfully

after having an code gen, please migrate your script to domain driven structure.

## Domain-Driven Structure
This project uses a domain-driven structure for Playwright tests. When migrating or creating new tests, ensure each script, page object, and step definition is placed in the appropriate domain folder that matches its business context.

## Folder Structure

src/
├── domains/
│   ├── authentication/
│   │   ├── pages/         # Page Objects for authentication domain
│   │   ├── steps/         # Step definitions for authentication features
│   │   └── usecases/      # Cross-cutting use cases (only if needed)
│   └── points/
│       ├── pages/         # Page Objects for points domain
│       ├── steps/         # Step definitions for points features
│       └── usecases/      # Cross-cutting use cases (only if needed)
├── shared/
│   ├── pages/             # Common Page Objects
│   └── utilities/         # Common utilities
└── features/              # All .feature files for Cucumber test cases

## Guidelines
- Place scripts, page objects, and steps in the domain that matches their business context (e.g., authentication, points).
- Use the `usecases` folder only for business logic or workflows that span multiple domains or require orchestration beyond simple UI actions.
- For most UI tests, steps should use page objects directly.
- Use `shared` for common utilities or page objects used across multiple domains.

## Example
If your Playwright script focuses on authentication, migrate it to `src/domains/authentication/`. If it focuses on points, use `src/domains/points/`.