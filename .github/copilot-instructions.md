GitHub Copilot Instructions — Money Keeper Project

Project Overview

Money Keeper is a full-stack financial management application.

The system consists of three main parts:

Backend
Spring Boot (Java 18, Maven)

Frontend
Vue 3 with Vite

End-to-End Testing
Playwright + Cucumber (BDD) using TypeScript

The application helps users manage personal finances including:

- Bank Accounts
- Transactions
- Categories
- Financial history tracking

Copilot should generate code that respects the architecture, domain model, and testing structure described below.

---

System Architecture

The backend follows a layered architecture.

Controller → Service → Repository → Database

Guidelines:

Controllers

- Handle HTTP requests and responses
- Perform request validation
- Should remain thin

Services

- Contain business logic
- Coordinate domain operations
- Call repositories when needed

Repositories

- Handle persistence
- Interact with the database
- Should not contain business logic

Entities

- Represent domain models
- Map directly to database tables

Backend technologies:

- Spring Boot
- Maven
- Flyway for database migrations
- Oracle database in CI environments
- H2 database for local development

Copilot should respect this layering when generating backend code.

---

Domain Model

The core domain includes the following entities.

Account
Represents a financial account such as:

- Bank account
- Cash
- Wallet

Transaction
Represents a financial activity.

Transaction types include:

- Income
- Expense
- Transfer
- Borrow
- Lend
- Adjustment

Category
Represents a classification for transactions such as:

- Food
- Transport
- Salary
- Shopping

Relationships:

- An Account can have many Transactions.
- A Transaction belongs to one Category.
- Transfers involve two Accounts (source and destination).

Copilot should follow these domain concepts when generating backend code or tests.

---

Database

Two databases are used depending on environment.

Local Development

- H2 in-memory database
- Used for fast local development

Migration scripts location:

backend/src/main/resources/db/migration/h2

CI / Integration Environment

- Oracle database

Migration scripts location:

backend/src/main/resources/db/migration/oracle

Guidelines:

- Flyway is used for schema versioning
- Migration scripts must be compatible with their target database
- Oracle migrations may contain Oracle-specific SQL
- H2 migrations support local development

---

Frontend

Frontend technologies:

- Vue 3
- Vite
- Composition API

Guidelines:

- Prefer Composition API over Options API
- Components should remain small and reusable
- UI components should avoid complex business logic
- Business logic should be separated from UI components when possible

Copilot should generate Vue components consistent with these patterns.

---

End-to-End Testing

E2E tests use:

- Playwright
- Cucumber (BDD)
- TypeScript

BDD scenarios describe business behavior.

Example:

Given the user is on the account page
When the user creates a new account
Then the account should appear in the account list

Tests should focus on user behavior rather than UI implementation details.

---

Test Automation Architecture

The E2E testing framework follows a layered test architecture.

Feature → Step Definition → Use Case → Page Object → Playwright Interaction

Responsibilities:

Feature Files

- Describe business scenarios in Gherkin
- Define user behavior

Step Definitions

- Map Gherkin steps to executable code
- Should remain thin
- Should delegate actions to Use Cases

Use Cases

- Encapsulate reusable business actions
- Coordinate interactions across pages
- Contain test workflow logic

Page Objects

- Contain UI selectors
- Implement Playwright interactions
- Encapsulate browser operations

Playwright

- Handles browser automation
- Used only inside Page Objects

Guidelines:

- Avoid placing Playwright code directly inside step definitions
- Reuse use cases when possible
- Keep steps readable and business-focused

---

Test Project Structure

The E2E test project follows a domain-based structure.

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

Guidelines:

- Domain folders group related tests
- Page objects contain UI interactions
- Step definitions call domain use cases
- Shared utilities contain reusable helpers

Copilot should generate test code following this structure.

---

Development Environment

The project uses containerized development.

Tools:

- Docker
- Docker Compose
- VSCode Dev Container

Services include:

- Oracle database
- Flyway migration runner

Ports used:

Frontend: 5173
Backend: 8080
Oracle: 1522 (host) → 1521 (container)

Copilot should generate commands compatible with this environment.

---

Code Style Guidelines

General principles:

- Write clean and readable code
- Prefer descriptive variable and method names
- Avoid unnecessary complexity
- Prefer small focused functions
- Follow existing project conventions

When generating new code, Copilot should align with the repository's existing architecture and patterns.