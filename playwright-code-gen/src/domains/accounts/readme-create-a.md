# cucumber playwright typescript

Using Playwright MCP please perform below steps:

1. Access page http://localhost:5173/accounts
2. Prepare account data by direct call backend API
   - POST /api/v1/accounts
   - Request body:
     ```json
     {
       "name": "Test Account",
       "type": "Bank Account",
       "balance": 1000,
       "currency": "USD",
       "description": "Test account description"
     }
     ```
   - Response body:
     ```json
     {}
     ```
     Then verify that the account was created successfully by calling backend API
     - GET /api/v1/accounts
     - Request body:
       ```json
       {
         "name": "Test Account"
       }
       ```
     - Response body:
       ```json
       {}
       ```
3. Click on button "Add Account"
4. Fill in the form with the following data:
   - account name: "Test Account"
   - select account type: "Bank Account"
   - input balance: 1000
   - select current currency: US Dollar
   - input description: "Test account description"
5. Click on button "Create"
6. Verify that message displayed is "Account name already exists"
7. Click on button "Cancel"
8. Verify that the account was not created

## After Code Generation - Migration Rules

After generating code with Playwright MCP, you must migrate your script to the domain-driven structure following these specific rules:

### 1. Code Structure Requirements

All generated code must be organized in the appropriate domain folder under `src/domains/{domain}/` where `{domain}` matches the business context (e.g., `accounts`, `authentication`, `points`).

### 2. File Generation Guidelines

When migrating generated code, create the following files in the domain folder:

#### Page Objects (`src/domains/{domain}/pages/`)

- Create a page object class that extends functionality for interacting with domain-specific UI elements
- Name the file `{domain-name}.playwright.page.ts` (e.g., `accounts.playwright.page.ts`)
- Each method should represent a single UI action or assertion
- Use Playwright's `Page` object for all interactions
- Include proper TypeScript typing for all parameters and return values

#### Step Definitions (`src/domains/{domain}/steps/`)

- Create step definition files that map Cucumber steps to page object methods
- Name the file `{domain-name}.steps.ts` (e.g., `account.steps.ts`)
- Use Cucumber's `Given`, `When`, `Then` decorators for step mapping
- Step definitions should be thin layers that call use case methods
- Extract data from Cucumber data tables using `dataTable.rowsHash()`
- Use the global hooks (`getAccountsPage()`, `getAccountUsecase()`) to access page objects and use cases

#### Use Cases (`src/domains/{domain}/usecases/`)

- Create a use case class that orchestrates page object methods for complex workflows
- Name the file `{domain-name}.use-case.ts` (e.g., `account.use-case.ts`)
- Use case methods should represent business operations, not individual UI actions
- Include both UI interactions and API calls when needed for data setup/cleanup
- Handle error cases appropriately with meaningful error messages

#### Data Transfer Objects (`src/domains/{domain}/types/`)

- Define interfaces for data structures used in the domain
- Name the file `{domain-name}.dto.ts` (e.g., `account.dto.ts`)
- Include validation logic in DTO classes when needed
- Provide conversion functions between different DTO representations

#### API Clients (`src/domains/{domain}/api/`)

- Create API client classes for backend interactions
- Name the file `{domain-name}-api.client.ts` (e.g., `account-api.client.ts`)
- Use Axios or other HTTP libraries for API calls
- Include proper error handling and logging
- Implement methods for CRUD operations and data cleanup

### 3. Integration with Existing Codebase

#### World Initialization

- Register new page objects and use cases in `src/shared/utilities/world.ts`
- Add new properties to the World class for access in step definitions
- Update the `initialize()` method to instantiate new domain objects

#### Global Hooks

- Add getter functions in `src/shared/utilities/hooks.ts` for new domain objects
- Follow the pattern: `get{Domain}Page()` and `get{Domain}Usecase()`

#### Feature Files

- Place feature files in `src/features/{domain}/` directory
- Use descriptive feature names that match the business context
- Include scenario outlines for data-driven testing when appropriate

### 4. Code Quality Standards

#### TypeScript Best Practices

- Use strict typing for all parameters and return values
- Include JSDoc comments for all public methods and classes
- Follow the existing code style and naming conventions
- Use async/await for all asynchronous operations

#### Playwright Best Practices

- Use explicit waits instead of implicit sleeps
- Use descriptive selector strategies (data-testid, text content, etc.)
- Handle dynamic content with appropriate wait conditions
- Take screenshots for failure debugging when needed

#### Testing Best Practices

- Use unique test data generation to avoid test interdependencies
- Implement proper cleanup in After hooks for created data
- Use environment variables for configurable values
- Include meaningful assertions with descriptive error messages

### 5. Example Migration

If your generated Playwright script creates an account, migrate it as follows:

1. Create `AccountsPlaywrightPage` in `src/domains/accounts/pages/accounts.playwright.page.ts` with methods for account creation workflow
2. Create `AccountUseCase` in `src/domains/accounts/usecases/account.use-case.ts` to orchestrate the account creation process
3. Update step definitions in `src/domains/accounts/steps/account.steps.ts` to use the new use case methods
4. Register new objects in `World` class and hooks
5. Create feature file in `src/features/accounts/account-creation.feature`

### 6. Validation Checklist

Before committing migrated code, ensure:

- [ ] All new files follow the naming conventions
- [ ] Page objects only contain UI interaction methods
- [ ] Step definitions are thin layers calling use cases
- [ ] Use cases contain business logic and orchestration
- [ ] All methods have proper TypeScript typing
- [ ] JSDoc comments are included for public methods
- [ ] Error handling is implemented appropriately
- [ ] New domain objects are registered in World class
- [ ] Global hooks are updated with getter functions
- [ ] Feature files are placed in correct directory
