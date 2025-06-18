# Domain-Driven Design (DDD) in the Money Keeper Backend

This document provides an overview and coaching guide on how Domain-Driven Design (DDD) principles are implemented in the Money Keeper backend project. It is intended to help developers understand the architecture, design patterns, and best practices used in this codebase.

---

## What is Domain-Driven Design (DDD)?

Domain-Driven Design (DDD) is a software development approach that focuses on modeling software to match a complex business domain. It emphasizes collaboration between technical and domain experts to create a shared understanding and a rich domain model that reflects real-world business rules and processes.

Key principles of DDD include:

- **Ubiquitous Language:** A common language shared by developers and domain experts.
- **Bounded Contexts:** Explicit boundaries within which a particular domain model applies.
- **Entities and Value Objects:** Core building blocks of the domain model representing business concepts.
- **Aggregates:** Clusters of domain objects treated as a single unit for data changes.
- **Repositories:** Abstractions for retrieving and persisting aggregates.
- **Domain Services:** Operations that don’t naturally fit within entities or value objects.
- **Layered Architecture:** Separation of concerns into layers such as domain, application, infrastructure, and interfaces.

---

## DDD Implementation in This Backend Project

The Money Keeper backend follows DDD principles with a clear layered architecture:

```
backend/src/main/java/com/personal/money/management/core/category/
├── domain/
│   ├── model/
│   │   └── Category.java
│   └── repository/
│       └── CategoryRepository.java
├── application/
│   └── CategoryService.java
├── infrastructure/
│   └── persistence/
│       ├── CategoryEntity.java
│       ├── CategoryJpaRepository.java
│       └── CategoryRepositoryImpl.java
└── interfaces/
    └── api/
        ├── CategoryController.java
        ├── CategoryMapper.java
        └── dto/
            ├── CategoryRequest.java
            └── CategoryResponse.java
```

### Domain Layer

- **Purpose:** Encapsulates the core business logic and rules.
- **Example:** `Category.java` represents the Category entity with attributes like `id`, `name`, `icon`, `type`, and `parent`.
- **Repository Interface:** `CategoryRepository.java` defines methods for saving, finding, and deleting categories, abstracting persistence details.
- **Characteristics:** Free from technical concerns, focused purely on business concepts.

### Application Layer

- **Purpose:** Coordinates domain operations and business use cases.
- **Example:** `CategoryService.java` contains methods like `createCategory`, `updateCategory`, and `deleteCategory`.
- **Responsibilities:** Validates business rules (e.g., cyclic dependency checks), manages transactions, handles exceptions, and delegates persistence to repositories.
- **Characteristics:** Does not contain domain logic but orchestrates domain model usage.

### Infrastructure Layer

- **Purpose:** Implements technical details such as database access.
- **Example:** `CategoryJpaRepository.java` is a Spring Data JPA repository; `CategoryRepositoryImpl.java` implements the domain repository interface.
- **Characteristics:** Depends on frameworks and external systems, isolated from domain logic.

### Interfaces Layer (API)

- **Purpose:** Exposes application functionality to clients via REST APIs.
- **Example:** `CategoryController.java` handles HTTP requests and responses, mapping DTOs to domain objects and vice versa.
- **Characteristics:** Keeps API concerns separate from domain and application logic.

---

## Key Design Patterns and Practices

- **Repository Pattern:** Abstracts data access behind interfaces in the domain layer, allowing flexibility in persistence implementation.
- **Entity Modeling:** Domain entities encapsulate business data and behavior, ensuring integrity and consistency.
- **Service Layer:** Application services manage use cases, transactions, and business workflows.
- **Exception Handling:** Custom exceptions represent domain-specific errors, improving error clarity.
- **Layered Architecture:** Clear separation of concerns enhances maintainability, testability, and scalability.

---

## Testing and Quality Assurance

To ensure the robustness and correctness of the DDD implementation, the following testing areas are covered:

### 1. Domain Layer Testing
- Unit tests for `Category` entity behavior and invariants.
- Tests for domain factory methods (e.g., `CategoryFactory`).
- Validation of domain rules such as cyclic dependency prevention.

### 2. Repository Layer Testing
- Unit tests for `CategoryRepository` interface implementations.
- Integration tests with the database for `CategoryJpaRepository` and `CategoryRepositoryImpl`.
- Verification of CRUD operations and query methods (e.g., `findByParent`).

### 3. Application Layer Testing
- Unit tests for `CategoryService` methods:
  - `createCategory`, `updateCategory`, `deleteCategory`.
  - Validation logic (parent existence, cyclic dependency).
  - Exception handling (e.g., `CategoryNotFoundException`, `CategoryConflictException`).
- Concurrency tests to simulate optimistic locking conflicts.

### 4. API Layer Testing
- Integration tests for `CategoryController` endpoints:
  - POST `/api/categories`
  - GET `/api/categories`
  - PUT `/api/categories/{id}`
  - DELETE `/api/categories/{id}`
- Validation of request payloads and response DTOs.
- Error response handling and status codes.

### 5. Cross-Cutting Concerns
- Global exception handling via `GlobalExceptionHandler`.
- Transaction management and rollback scenarios.

---

## Benefits of This DDD Approach

- Aligns software design closely with business domain concepts.
- Improves code organization and readability.
- Facilitates unit testing by isolating domain logic.
- Enables flexibility to change infrastructure without affecting domain.
- Supports complex business rules and validations effectively.

---

## Summary

This backend project demonstrates a robust implementation of Domain-Driven Design principles. Understanding this structure and the responsibilities of each layer will help developers contribute effectively and maintain the codebase with best practices.

For further learning, consider exploring:

- Eric Evans' *Domain-Driven Design: Tackling Complexity in the Heart of Software*
- Vaughn Vernon's *Implementing Domain-Driven Design*
- Spring Framework documentation on layered architecture and repositories

---

This concludes the DDD coaching guide for the Money Keeper backend.
