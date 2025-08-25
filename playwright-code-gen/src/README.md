# Domain-Driven Playwright Tests

This project contains automated tests for the Money Keeper application using Playwright with a domain-driven design structure.

## Project Structure

The project follows a domain-driven design approach with the following structure:

```
src/
├── domains/
│   └── accounts/
│       ├── pages/         # Page Objects for accounts domain
│       └── steps/         # Step definitions for accounts features
├── features/              # Cucumber feature files
├── shared/
│   └── utilities/         # Shared utilities and helpers
└── tests/                 # Playwright test files
```

## Available Tests

### Playwright Tests

The project includes direct Playwright tests that can be run without Cucumber:

- `accounts.spec.ts`: Tests for account creation and management

### Cucumber Features

The project also includes Cucumber feature files for BDD-style testing:

- `account-creation.feature`: Feature for creating and verifying accounts

## Running Tests

### Prerequisites

- Node.js installed
- Application running at http://localhost:5173

### Installation

```bash
npm install
```

### Running Playwright Tests

```bash
npm test
```

### Running Cucumber Tests

```bash
npm run test:cucumber
```

## Adding New Tests

When adding new tests, follow these guidelines:

1. Place page objects in the appropriate domain folder under `pages/`
2. Place step implementations in the appropriate domain folder under `steps/`
3. For shared utilities, use the `shared/utilities/` folder
4. For Cucumber features, add them to the `features/` folder

## Example Test

The project includes an example test for creating a new account:

1. Navigate to the accounts page
2. Click on "Add Account" button
3. Fill in the account form with test data
4. Submit the form
5. Verify the account was created successfully

## Lifecycle Guidelines

- Page Objects & UI Use Cases: `@Transient` (không lưu state).
- Container per-scenario: an toàn. Container global: vẫn `@Transient`, nhưng tuyệt đối không giữ state.
- Dùng `@Singleton` cho cấu hình/clients stateless khi cần chia sẻ.
