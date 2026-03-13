AI Agent Task Guidelines

Purpose

This document provides guidelines for AI agents working on the Money Keeper repository.

It explains how new features, tests, and improvements should be implemented in a consistent and maintainable way.

Agents should read the following documents before implementing changes:

- docs/architecture.md
- docs/domain-model.md
- docs/automation-architecture.md
- docs/repository-map.md

---

Development Workflow

When implementing a new feature, follow this workflow.

1. Understand the domain concept from "docs/domain-model.md".
2. Identify affected components using "docs/repository-map.md".
3. Follow architecture rules defined in "docs/architecture.md".
4. Implement or update automated tests following "docs/automation-architecture.md".

---

Feature Development Process

Typical feature development follows this order:

1. Define or update the BDD feature scenario.
2. Implement step definitions.
3. Implement reusable use cases.
4. Implement or update page objects.
5. Implement backend or frontend logic if required.
6. Run automated tests.

Example flow:

Feature → Step Definition → Use Case → Page Object → Playwright

---

Backend Development Guidelines

Backend uses a layered architecture.

Controller → Service → Repository → Database

Rules:

Controllers should remain thin.
Business logic should be placed in services.
Repositories should only handle database access.

When implementing new functionality:

- create or update service logic
- expose functionality via controller endpoints
- avoid placing business logic inside controllers

---

Frontend Development Guidelines

Frontend uses Vue 3 with the Composition API.

Rules:

Prefer Composition API over Options API.
Keep components small and reusable.
Avoid mixing business logic with UI components.

Reusable logic should be placed in composables or services.

---

Test Automation Guidelines

Automation tests follow this structure:

Feature → Step Definition → Use Case → Page Object

Rules:

Step definitions should remain thin.
Business workflows belong in use cases.
Playwright code should only exist inside page objects.

Avoid placing browser automation code inside step definitions.

---

Code Quality Guidelines

When generating code:

- follow existing project conventions
- use descriptive variable names
- prefer small and focused functions
- avoid unnecessary complexity

Consistency with the existing codebase is more important than introducing new patterns.

---

Safe Change Principles

When modifying existing code:

- avoid breaking existing features
- reuse existing services and components
- update related tests when behavior changes

If a change affects domain behavior, ensure BDD scenarios still represent the expected business behavior.

---

AI Agent Behavior Expectations

AI agents should:

- read documentation before modifying code
- follow repository structure and architecture
- prioritize readability and maintainability
- avoid introducing unnecessary abstractions

If unsure where to place code, refer to:

"docs/repository-map.md"