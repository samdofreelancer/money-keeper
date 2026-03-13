Money Keeper Architecture

Overview

Money Keeper is a full-stack personal finance management application.

The system allows users to manage:

- Accounts
- Transactions
- Categories
- Financial history

The project consists of three main components:

Frontend
Vue 3 application built with Vite.

Backend
Spring Boot REST API built with Java 18 and Maven.

End-to-End Testing
BDD test framework using Playwright + Cucumber written in TypeScript.

---

System Architecture

The system follows a typical web application architecture.

Frontend (Vue 3)
|
v
Backend (Spring Boot REST API)
|
v
Database (H2 / Oracle)

Frontend communicates with the backend through REST APIs.

The backend manages business logic and database persistence.

---

Backend Architecture

The backend follows a layered architecture.

Controller → Service → Repository → Database

Responsibilities:

Controller

- Exposes REST APIs
- Handles HTTP requests and responses
- Validates request input

Service

- Implements business logic
- Coordinates domain operations
- Calls repositories

Repository

- Handles persistence logic
- Interacts with the database
- Maps entities to tables

Database

- Stores application data
- Managed through Flyway migrations

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

Represents a classification for transactions.

Examples:

- Food
- Transport
- Salary
- Shopping

Relationships

- An Account can have many Transactions.
- A Transaction belongs to one Category.
- Transfers involve two Accounts.

Example domain diagram:

Account
|
| 1..*
v
Transaction -----> Category
|
|
v
Transfer (source → destination account)

---

Database Strategy

The project supports two database environments.

Local Development

H2 in-memory database is used for fast development and testing.

Migration scripts:

backend/src/main/resources/db/migration/h2

CI / Integration

Oracle database is used in CI pipelines.

Migration scripts:

backend/src/main/resources/db/migration/oracle

Flyway is used for database versioning and migration management.

---

Frontend Architecture

Frontend is built using:

- Vue 3
- Vite
- Composition API

Design principles:

- Components should remain small and reusable
- UI components should avoid complex business logic
- Business logic should be separated from presentation when possible

The frontend communicates with the backend using REST APIs.

---

Test Automation Architecture

End-to-end testing follows a layered automation architecture.

Feature → Step Definition → Use Case → Page Object → Playwright

Responsibilities

Feature Files

- Written in Gherkin
- Describe business scenarios

Step Definitions

- Map Gherkin steps to code
- Should remain thin
- Delegate actions to use cases

Use Cases

- Encapsulate reusable business workflows
- Coordinate interactions between pages

Page Objects

- Contain UI locators
- Implement Playwright interactions

Playwright

- Executes browser automation

Example flow

Feature Scenario
↓
Step Definition
↓
AccountUseCase
↓
AccountPage
↓
Playwright Browser Action

---

Repository Structure

Example repository structure:

backend/
frontend/
tests/

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

Each domain folder groups related test automation components.

---

Development Environment

The project uses containerized development.

Tools

- Docker
- Docker Compose
- VSCode Dev Container

Services

- Oracle database
- Flyway migration runner

Ports

Frontend: 5173
Backend: 8080
Oracle: 1522 → 1521

---

Design Principles

The project emphasizes:

- Clean architecture
- Clear domain modeling
- Readable BDD tests
- Reusable automation components
- Separation of concerns

The codebase is structured so both developers and AI coding tools can easily understand the architecture and domain model.