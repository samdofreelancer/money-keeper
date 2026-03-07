GitHub Copilot Custom Instructions – Money Keeper Project

Project Overview

Money Keeper is a full-stack financial management application.

The system consists of three main parts:

Backend: Spring Boot (Java 18, Maven)
Frontend: Vue 3 with Vite
End-to-End Testing: Playwright + Cucumber (BDD) using TypeScript

The application helps users manage personal finances including:

- Bank accounts
- Transactions
- Categories
- Financial history

Copilot should generate code that respects the architecture and conventions described below.

---

System Architecture

The backend follows a layered architecture.

Controller → Service → Repository → Database

Guidelines:

- Controllers should remain thin and only handle HTTP requests and responses.
- Business logic must be implemented inside Services.
- Repositories are responsible only for persistence.
- Entities represent domain models mapped to database tables.

Backend technologies:

- Spring Boot
- Maven
- Flyway for database migrations
- Oracle database in CI environment
- H2 database for local development

---

Domain Model

The core domain consists of the following entities.

Account
Represents a financial account such as a bank account, wallet, or cash balance.

Transaction
Represents a financial activity such as:

- Income
- Expense
- Transfer
- Borrow
- Lend

Category
Represents a classification for transactions such as:

- Food
- Transport
- Salary
- Shopping

Relationships:

- An Account can contain many Transactions.
- A Transaction belongs to one Category.
- Transfers involve two Accounts (source and destination).

Copilot should respect these domain concepts when generating backend or test code.

---

Database

Two databases are used depending on the environment.

Local Development:

H2 in-memory database

Migration scripts location:

backend/src/main/resources/db/migration/h2

CI Environment:

Oracle database

Migration scripts location:

backend/src/main/resources/db/migration/oracle

Guidelines:

- Migration scripts must be compatible with the target database.
- Oracle migrations may contain Oracle-specific SQL.
- H2 migrations should support local testing.

Flyway is used for database versioning.

---

Frontend

Frontend is built using:

- Vue 3
- Vite
- Composition API

Guidelines:

- Prefer Composition API over Options API.
- Components should remain small and reusable.
- UI components should not contain complex business logic.
- Business logic should be separated from UI components where possible.

---

End-to-End Testing

E2E tests use:

- Playwright
- Cucumber (BDD)
- TypeScript

Tests should follow BDD principles.

Feature files describe business scenarios.

Example:

Given the user is on the account page
When the user creates a new account
Then the account should appear in the account list

Step definitions implement the behavior of these steps.

Page objects encapsulate UI interactions and locators.

Recommended flow:

Feature → Step Definition → Use Case → Page Object → Playwright Interaction

Step definitions should remain thin and readable.

---

Test Project Structure

The E2E test project uses a domain-based structure.

Example:

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

Guidelines:

- Page objects contain UI locators and browser interactions.
- Step definitions should delegate actions to domain use cases.
- Use cases encapsulate reusable business actions.
- Avoid placing complex Playwright logic inside step definitions.

---

Testing Philosophy

Tests should prioritize readability and business behavior.

Prefer BDD scenarios that reflect real user actions.

Avoid coupling tests tightly with UI implementation details.

Tests should describe behavior rather than internal implementation.

---

Development Environment

The project uses:

- Docker
- Docker Compose
- VSCode Dev Container

Services include:

Oracle database
Flyway migration runner

Ports used:

Frontend: 5173
Backend: 8080
Oracle: 1522 (host) → 1521 (container)

Copilot should generate commands and scripts compatible with this environment.

---

Code Style

General coding principles:

- Write clean and readable code.
- Prefer descriptive variable and method names.
- Avoid unnecessary complexity.
- Prefer small and focused functions.
- Follow existing project structure and naming conventions.

Copilot should align generated code with existing project patterns whenever possible.