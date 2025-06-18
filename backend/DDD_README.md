# Domain-Driven Design (DDD) in the Money Keeper Backend

This document provides a comprehensive overview and coaching guide on how Domain-Driven Design (DDD) principles are implemented in the Money Keeper backend project. It is designed to help developers at all levels understand the architecture, design patterns, best practices, and practical considerations used in this codebase.

---

## What is Domain-Driven Design (DDD)?

Domain-Driven Design (DDD) is a software development approach that focuses on modeling software to closely match a complex business domain. It emphasizes collaboration between technical and domain experts to create a shared understanding and a rich domain model that reflects real-world business rules and processes.

Key principles of DDD include:

- **Ubiquitous Language:** A common language shared by developers and domain experts to ensure clear communication.
- **Bounded Contexts:** Explicit boundaries within which a particular domain model applies, helping to manage complexity.
- **Entities and Value Objects:** Core building blocks of the domain model representing business concepts with identity and attributes.
- **Aggregates:** Clusters of domain objects treated as a single unit for data changes and consistency.
- **Repositories:** Abstractions for retrieving and persisting aggregates, decoupling domain logic from infrastructure.
- **Domain Services:** Operations that don’t naturally fit within entities or value objects but are part of the domain logic.
- **Layered Architecture:** Separation of concerns into layers such as domain, application, infrastructure, and interfaces to organize code and responsibilities.

---

## DDD Implementation in This Backend Project

The Money Keeper backend follows DDD principles with a clear layered architecture that promotes separation of concerns and maintainability:

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
- **Characteristics:** Free from technical concerns, focused purely on business concepts and rules.

### Application Layer

- **Purpose:** Coordinates domain operations and business use cases.
- **Example:** `CategoryService.java` contains methods like `createCategory`, `updateCategory`, and `deleteCategory`.
- **Responsibilities:** Validates business rules (e.g., cyclic dependency checks), manages transactions, handles exceptions, and delegates persistence to repositories.
- **Characteristics:** Does not contain domain logic but orchestrates domain model usage and application workflows.

### Infrastructure Layer

- **Purpose:** Implements technical details such as database access and external integrations.
- **Example:** `CategoryJpaRepository.java` is a Spring Data JPA repository; `CategoryRepositoryImpl.java` implements the domain repository interface.
- **Characteristics:** Depends on frameworks and external systems, isolated from domain logic to maintain separation.

### Interfaces Layer (API)

- **Purpose:** Exposes application functionality to clients via REST APIs.
- **Example:** `CategoryController.java` handles HTTP requests and responses, mapping DTOs to domain objects and vice versa.
- **Characteristics:** Keeps API concerns separate from domain and application logic, focusing on communication and data transfer.

---

## Key Design Patterns and Practices

- **Repository Pattern:** Abstracts data access behind interfaces in the domain layer, allowing flexibility in persistence implementation and easier testing.
- **Entity Modeling:** Domain entities encapsulate business data and behavior, ensuring integrity, consistency, and encapsulation of business rules.
- **Service Layer:** Application services manage use cases, transactions, and business workflows, coordinating domain objects without containing domain logic.
- **Exception Handling:** Custom exceptions represent domain-specific errors, improving error clarity and enabling precise error management.
- **Layered Architecture:** Clear separation of concerns enhances maintainability, testability, scalability, and team collaboration.

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
- Improves code organization, readability, and maintainability.
- Facilitates unit testing by isolating domain logic.
- Enables flexibility to change infrastructure without affecting domain.
- Supports complex business rules and validations effectively.
- Enhances team collaboration through clear separation of concerns.

---

## Why Use Domain-Driven Design (DDD)?

DDD helps manage complex business domains by aligning software design closely with business concepts. It promotes a shared language between developers and domain experts, improving communication and reducing misunderstandings. DDD encourages building a rich domain model that encapsulates business rules, leading to more maintainable and flexible software.

---

## Difference Between DDD and Spring MVC

- **DDD** is an architectural and design approach focused on modeling the business domain with layers such as domain, application, infrastructure, and interfaces. It emphasizes domain logic and separation of concerns.
- **Spring MVC** is a web framework primarily concerned with handling HTTP requests and responses, routing, and view rendering. It is often used in the interfaces layer of a DDD application but does not prescribe domain modeling or architectural patterns.

In short, Spring MVC can be part of a DDD implementation but does not replace the domain modeling and layered architecture principles of DDD.

---

## When Should We Choose DDD?

DDD is most beneficial when:

- The business domain is complex and requires deep understanding.
- The project involves complex business rules and workflows.
- Long-term maintainability and flexibility are priorities.
- Collaboration between domain experts and developers is essential.
- The system needs to evolve with changing business requirements.

For simple CRUD applications or projects with minimal business logic, DDD might be overkill.

---

## Challenges When Applying DDD

- Requires significant upfront investment in learning and modeling the domain.
- Can increase initial development time due to complexity.
- Needs close collaboration with domain experts.
- Risk of over-engineering if applied to simple domains.
- Requires discipline to maintain separation of concerns and avoid anemic domain models.

---

## Can We Apply DDD in Projects Without Direct Database Access?

Yes, DDD can be applied in projects that do not have direct database access, such as those that only call third-party APIs or Java server faces with XHTML and JavaBeans. The key is to focus on modeling the domain and business logic regardless of the data source. The infrastructure layer can adapt to different data sources or external systems, while the domain and application layers remain consistent.

---

## Abstracting Transaction Management to Reduce Framework Dependency

In the current backend project, the application layer uses Spring Boot's transaction management via the `@Transactional` annotation. While this is a common and effective approach, it does introduce some coupling to the Spring framework, which can make switching to another framework more challenging.

### Trade-offs of Using Spring Transactions Directly

- **Pros:**
  - Simplifies transaction management with declarative annotations.
  - Integrates seamlessly with Spring's data access and persistence layers.
  - Reduces boilerplate code for transaction demarcation.

- **Cons:**
  - Couples the application layer to Spring-specific APIs.
  - Makes it harder to migrate to other frameworks or platforms.
  - Can obscure transaction boundaries if not carefully managed.

### Recommendations to Minimize Coupling

1. **Use a Transaction Script or Unit of Work Pattern:**
   - Encapsulate transaction boundaries in dedicated classes or services.
   - The application service calls these transaction scripts, which internally manage transactions.
   - This isolates transaction management from business logic.

2. **Define a Transaction Manager Interface:**
   - Create an abstraction for transaction management in the domain or application layer.
   - Implement this interface using Spring's transaction manager in the infrastructure layer.
   - This allows swapping implementations without changing domain or application code.

3. **Keep Domain Layer Free of Transaction Annotations:**
   - Ensure that transaction management annotations or APIs are only in the application or infrastructure layers.
   - The domain layer remains pure and framework-agnostic.

4. **Use Programmatic Transaction Management if Needed:**
   - Instead of annotations, use programmatic transaction management in infrastructure classes.
   - This can provide finer control and clearer separation.

### Example: Transaction Manager Interface

```java
public interface TransactionManager {
    void begin();
    void commit();
    void rollback();
}
```

An implementation using Spring's `PlatformTransactionManager` can be provided in the infrastructure layer.

### Summary

By abstracting transaction management behind interfaces and isolating it from domain logic, you can reduce framework dependency and improve portability. This approach aligns well with DDD principles of separation of concerns and maintaining a pure domain model.

---

## Summary

This backend project demonstrates a robust implementation of Domain-Driven Design principles. Understanding this structure and the responsibilities of each layer will help developers contribute effectively and maintain the codebase with best practices.

For further learning, consider exploring:

- Eric Evans' *Domain-Driven Design: Tackling Complexity in the Heart of Software*
- Vaughn Vernon's *Implementing Domain-Driven Design*
- Spring Framework documentation on layered architecture and repositories

---
## Case Study: Breaking Down a Large Pull Request (PR)

When working on complex features or improvements, large PRs can become difficult to review and manage. Here is a case study and tips on how to effectively break down big PRs into manageable, logical units.

### Example Case Study: Optimistic Locking and Child Category Check

A big PR was split into multiple smaller PRs with clear scopes:

1. **Backend: Add Optimistic Locking and Child Category Check**
   - Add `@Version` to `CategoryEntity` for optimistic locking.
   - Update `CategoryService`, `CategoryRepository`, and implementation to:
     - Check for child categories before delete.
     - Add `findByParent()` method to repository.
     - Use setters in `Category` domain model.
   - Add DB migration for index on `parent_category_id`.
   - Files involved: `CategoryService.java`, `CategoryRepository.java`, `CategoryRepositoryImpl.java`, `CategoryEntity.java`, `CategoryJpaRepository.java`, `CategoryEntityMapper.java`, `Category.java`, `V2__add_index_on_parent_category_id.sql`.

2. **Backend: Introduce Custom Exceptions for Category Operations**
   - Add new exception classes: `CategoryConflictException`, `CategoryHasChildException`.
   - Files: `CategoryConflictException.java`, `CategoryHasChildException.java`.

3. **Backend: Update API Error Handling and Response Structure**
   - Add `ApiErrorResponse` DTO.
   - Update `GlobalExceptionHandler` for structured error responses.
   - Update README to document new error response format.
   - Files: `ApiErrorResponse.java`, `GlobalExceptionHandler.java`, `backend/README.md`.

4. **Backend: Unit and Integration Test Enhancements**
   - Add/extend test coverage for concurrency, deletion with children, error cases.
   - Files: `CategoryServiceTest.java`, `CategoryControllerTest.java`, `CategoryServiceConcurrencyTest.java`.

5. **Frontend: Add Delete Category API & Store Support**
   - Add delete method in API client and store.
   - Files: `src/api/category.ts`, `src/stores/category.ts`.

6. **Frontend: Integrate Category Deletion in UI**
   - Wire up delete confirmation dialog and call store delete method.
   - File: `CategoryView.vue`.

### Suggested PR Delivery Order

| PR # | Scope/Type                  | Depends On |
|-------|----------------------------|------------|
| 1     | DB/model changes            | —          |
| 2     | Service/repository logic    | 1          |
| 3     | API handlers/controllers    | 2          |
| 4     | Frontend store/api          | 3          |
| 5     | UI                         | 4          |
| 6     | Tests                      | Each above |
| 7     | Documentation              | Each above |

### Tips for Breaking Down PRs

- **Identify Logical Units of Change:** Group related changes by feature, bugfix, or refactor.
- **Categorize by Type:** Backend logic, DB migration, API changes, frontend, tests, docs.
- **Create PRs in Logical Order:** Foundation first, then dependent features.
- **Keep PRs Reviewable:** Limit size, single responsibility, clear descriptions.
- **Use Feature Branches and Stacking:** Stack PRs on previous branches if needed.
- **Avoid Mixing Concerns:** Separate bugfixes, features, and refactors.

### Additional Suggestions

- Ensure exception messages are clear and user-friendly.
- Handle null and edge cases in mappers and repositories.
- Add tests for concurrency and error scenarios.
- Consider logging and user notifications in frontend error handling.
- Maintain consistent HTTP status codes for API errors.
- Use generic exception handlers for unexpected errors.
- Consider internationalization for error messages if applicable.

---

This case study and tips provide practical guidance for managing large changes effectively, improving code quality, and facilitating team collaboration.

---
## Reference Pull Requests for Case Study and Implementation

For detailed examples and practical implementation of the concepts discussed in this guide, please refer to the following pull requests in the Money Keeper project repository:

1. **Backend: Add Optimistic Locking and Child Category Check**  
   [PR #24](https://github.com/samdofreelancer/money-keeper/pull/24)  
   - Adds `@Version` to `CategoryEntity` for optimistic locking.  
   - Updates `CategoryService`, `CategoryRepository`, and implementation to check for child categories before delete, add `findByParent()` method, and use setters in the domain model.  
   - Includes DB migration for index on `parent_category_id`.

2. **Backend: Introduce Custom Exceptions for Category Operations**  
   [PR #25](https://github.com/samdofreelancer/money-keeper/pull/25)  
   - Adds new exception classes: `CategoryConflictException`, `CategoryHasChildException`.

3. **Backend: Update API Error Handling and Response Structure**  
   [PR #26](https://github.com/samdofreelancer/money-keeper/pull/26)  
   - Adds `ApiErrorResponse` DTO and updates `GlobalExceptionHandler` for structured error responses.  
   - Updates README to document new error response format.

4. **Backend: Unit and Integration Test Enhancements**  
   [PR #27](https://github.com/samdofreelancer/money-keeper/pull/27)  
   - Adds and extends test coverage for concurrency, deletion with children, and error cases.

5. **Frontend: Add Delete Category API & Store Support**  
   [PR #28](https://github.com/samdofreelancer/money-keeper/pull/28)  
   - Adds delete method in API client and store.

6. **Frontend: Integrate Category Deletion in UI**  
   [PR #29](https://github.com/samdofreelancer/money-keeper/pull/29)  
   - Wires up delete confirmation dialog and calls store delete method.

These PRs provide a practical breakdown of the implementation, testing, and integration of features following DDD principles and best practices.

---

This concludes the DDD coaching guide for the Money Keeper backend.
            └── CategoryResponse.java

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
## Why Use Domain-Driven Design (DDD)?

DDD helps manage complex business domains by aligning software design closely with business concepts. It promotes a shared language between developers and domain experts, improving communication and reducing misunderstandings. DDD encourages building a rich domain model that encapsulates business rules, leading to more maintainable and flexible software.

## Difference Between DDD and Spring MVC

- **DDD** is an architectural and design approach focused on modeling the business domain with layers such as domain, application, infrastructure, and interfaces. It emphasizes domain logic and separation of concerns.
- **Spring MVC** is a web framework primarily concerned with handling HTTP requests and responses, routing, and view rendering. It is often used in the interfaces layer of a DDD application but does not prescribe domain modeling or architectural patterns.

In short, Spring MVC can be part of a DDD implementation but does not replace the domain modeling and layered architecture principles of DDD.

## When Should We Choose DDD?

DDD is most beneficial when:

- The business domain is complex and requires deep understanding.
- The project involves complex business rules and workflows.
- Long-term maintainability and flexibility are priorities.
- Collaboration between domain experts and developers is essential.
- The system needs to evolve with changing business requirements.

For simple CRUD applications or projects with minimal business logic, DDD might be overkill.

## Challenges When Applying DDD

- Requires significant upfront investment in learning and modeling the domain.
- Can increase initial development time due to complexity.
- Needs close collaboration with domain experts.
- Risk of over-engineering if applied to simple domains.
- Requires discipline to maintain separation of concerns and avoid anemic domain models.

## Can We Apply DDD in Projects Without Direct Database Access?

Yes, DDD can be applied in projects that do not have direct database access, such as those that only call third-party APIs or Java server faces with XHTML and JavaBeans. The key is to focus on modeling the domain and business logic regardless of the data source. The infrastructure layer can adapt to different data sources or external systems, while the domain and application layers remain consistent.

---

## Summary

This backend project demonstrates a robust implementation of Domain-Driven Design principles. Understanding this structure and the responsibilities of each layer will help developers contribute effectively and maintain the codebase with best practices.

For further learning, consider exploring:

- Eric Evans' *Domain-Driven Design: Tackling Complexity in the Heart of Software*
- Vaughn Vernon's *Implementing Domain-Driven Design*
- Spring Framework documentation on layered architecture and repositories

---
## Abstracting Transaction Management to Reduce Framework Dependency

In the current backend project, the application layer uses Spring Boot's transaction management via the `@Transactional` annotation. While this is a common and effective approach, it does introduce some coupling to the Spring framework, which can make switching to another framework more challenging.

### Trade-offs of Using Spring Transactions Directly

- **Pros:**
  - Simplifies transaction management with declarative annotations.
  - Integrates seamlessly with Spring's data access and persistence layers.
  - Reduces boilerplate code for transaction demarcation.

- **Cons:**
  - Couples the application layer to Spring-specific APIs.
  - Makes it harder to migrate to other frameworks or platforms.
  - Can obscure transaction boundaries if not carefully managed.

### Recommendations to Minimize Coupling

1. **Use a Transaction Script or Unit of Work Pattern:**
   - Encapsulate transaction boundaries in dedicated classes or services.
   - The application service calls these transaction scripts, which internally manage transactions.
   - This isolates transaction management from business logic.

2. **Define a Transaction Manager Interface:**
   - Create an abstraction for transaction management in the domain or application layer.
   - Implement this interface using Spring's transaction manager in the infrastructure layer.
   - This allows swapping implementations without changing domain or application code.

3. **Keep Domain Layer Free of Transaction Annotations:**
   - Ensure that transaction management annotations or APIs are only in the application or infrastructure layers.
   - The domain layer remains pure and framework-agnostic.

4. **Use Programmatic Transaction Management if Needed:**
   - Instead of annotations, use programmatic transaction management in infrastructure classes.
   - This can provide finer control and clearer separation.

### Example: Transaction Manager Interface

```java
public interface TransactionManager {
    void begin();
    void commit();
    void rollback();
}
```

An implementation using Spring's `PlatformTransactionManager` can be provided in the infrastructure layer.

### Summary

By abstracting transaction management behind interfaces and isolating it from domain logic, you can reduce framework dependency and improve portability. This approach aligns well with DDD principles of separation of concerns and maintaining a pure domain model.

---

This concludes the DDD coaching guide for the Money Keeper backend.
