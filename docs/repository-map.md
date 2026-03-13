Repository Map

Purpose

This document describes the structure of the Money Keeper repository.

It helps developers and AI agents quickly locate where different types of code are implemented.

---

Top-Level Structure

The repository contains three main components.

backend/
Spring Boot backend application.

frontend/
Vue 3 frontend application.

tests/
End-to-end test automation using Playwright and Cucumber.

docs/
Architecture and domain documentation.

.github/
GitHub configuration and Copilot instructions.

---

Backend Structure

Backend source code is located in:

backend/src/main/java/

Typical layers follow this structure:

controller/
REST API controllers.

service/
Business logic and domain operations.

repository/
Persistence logic and database access.

entity/
Domain entities mapped to database tables.

Example flow:

Controller → Service → Repository → Database

---

Frontend Structure

Frontend source code is located in:

frontend/src/

Typical structure includes:

components/
Reusable UI components.

pages/
Page-level components.

services/
API communication with backend.

composables/
Vue Composition API logic.

---

Test Automation Structure

Test automation code is located in:

tests/

The automation framework follows a domain-based structure.

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

---

Test Folder Responsibilities

domains/
Contains test code organized by business domain.

Example:

accounts/
Test automation for account-related features.

pages/
Page objects containing UI selectors and Playwright interactions.

steps/
Step definitions for BDD scenarios.

usecases/
Reusable business workflows used by tests.

types/
Shared types and interfaces.

shared/
Utilities and shared configuration used across domains.

features/
BDD feature files written in Gherkin.

---

Example Automation Flow

Example implementation flow for a feature:

Feature file
→ Step definition
→ Use case
→ Page object
→ Playwright browser interaction

Example mapping:

Feature
tests/features/create-account.feature

Step Definition
tests/domains/accounts/steps/account.steps.ts

Use Case
tests/domains/accounts/usecases/accountUseCase.ts

Page Object
tests/domains/accounts/pages/accountPage.ts

---

Documentation

Architecture documentation is located in:

docs/architecture.md

Domain model documentation is located in:

docs/domain-model.md

Test automation architecture is described in:

docs/automation-architecture.md

---

Guidelines for AI Agents

When implementing new features or tests:

1. Identify the relevant domain (accounts, transactions, etc.).
2. Locate the corresponding domain folder inside "tests/domains/".
3. Implement step definitions inside "steps/".
4. Implement reusable workflows inside "usecases/".
5. Implement UI interactions inside "pages/".

AI agents should use this repository map to locate the correct files and maintain consistency with the project structure.