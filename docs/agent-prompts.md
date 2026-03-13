AI Agent Prompts

Purpose

This document provides reusable prompts for AI agents working on the Money Keeper repository.

These prompts help ensure that AI-generated code follows the architecture, domain model, and repository structure defined in the documentation.

Before executing tasks, agents should read the following documents:

- docs/domain-model.md
- docs/architecture.md
- docs/automation-architecture.md
- docs/repository-map.md
- AGENT_TASK_GUIDELINES.md

---

Prompt: Implement a New Automation Feature

Task:

Implement a new test automation scenario for the Money Keeper project.

Instructions:

1. Start from the BDD feature scenario.
2. Implement step definitions inside the appropriate domain folder.
3. Delegate business workflows to a use case.
4. Implement UI interactions inside page objects.
5. Ensure Playwright code only exists inside page objects.

Architecture pattern to follow:

Feature
→ Step Definition
→ Use Case
→ Page Object
→ Playwright

Ensure code follows the repository structure described in:

docs/repository-map.md

---

Prompt: Implement Backend Feature

Task:

Implement a backend feature following the Spring Boot layered architecture.

Architecture rules:

Controller → Service → Repository → Database

Guidelines:

- Controllers should expose REST APIs only.
- Business logic must be implemented in services.
- Repositories should handle persistence only.

Follow domain concepts defined in:

docs/domain-model.md

---

Prompt: Implement Frontend Feature

Task:

Implement a frontend feature using Vue 3.

Guidelines:

- Use the Composition API.
- Keep components small and reusable.
- Separate UI logic from business logic.

Place files according to the structure defined in:

docs/repository-map.md

---

Prompt: Improve Existing Code

Task:

Refactor or improve existing code while preserving current functionality.

Guidelines:

- Maintain compatibility with existing architecture.
- Do not introduce unnecessary complexity.
- Follow the domain model and architecture documentation.

---

Prompt: Debug a Test Failure

Task:

Investigate and fix a failing Playwright test.

Steps:

1. Identify failing feature scenario.
2. Locate related step definition.
3. Trace workflow in use case.
4. Inspect page object for selector or interaction issues.
5. Verify browser interaction using Playwright.

Ensure the fix follows the test automation architecture.