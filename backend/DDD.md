# Domain-Driven Design (DDD) in the Money Keeper Backend

*This document provides a comprehensive overview and coaching guide on how Domain-Driven Design (DDD) principles are implemented in the Money Keeper backend project.*

---

## What is Domain-Driven Design (DDD)?

Domain-Driven Design (DDD) is a software development approach that focuses on modeling software to closely match a complex business domain. It emphasizes collaboration between technical and domain experts to create a shared understanding and a rich domain model that reflects real-world business rules and processes.

### Key Principles
- **Ubiquitous Language**: A common language shared by developers and domain experts to ensure clear communication.
- **Bounded Contexts**: Explicit boundaries within which a particular domain model applies, helping to manage complexity.  
  *The Money Keeper backend is organized into bounded contexts to manage complexity. The Category bounded context focuses specifically on managing budget and transaction groupings. This separation ensures that the category model is tailored to its specific domain, without being influenced by unrelated concerns like transaction processing or user authentication. Other bounded contexts, such as transactions or user management, are handled separately to maintain clarity and avoid overlapping models.*
- **Entities and Value Objects**: Core building blocks representing business concepts.  
  *Value Objects* are immutable objects that represent descriptive aspects of the domain with no conceptual identity, such as a monetary amount or a date range. They help model concepts defined solely by their attributes rather than a unique identity.
- **Aggregates**: Clusters of domain objects treated as a single unit for data changes and consistency.
- **Repositories**: Abstractions for retrieving and persisting aggregates.
- **Domain Services**: Operations that don’t fit naturally within entities or value objects.
- **Layered Architecture**: Separation of concerns into distinct layers.

---

## Ubiquitous Language: Money Keeper Glossary

- **Category**: Represents a budget or transaction grouping (e.g., Food).
- **Parent**: A parent category, allowing hierarchical relationships.
- **Type**: The kind of category (e.g., Expense, Income).
- **Icon**: Visual icon or symbol representing a category.

---

## Architecture Overview

The Money Keeper backend is built using **Domain-Driven Design (DDD)** principles, emphasizing a clear separation of concerns and a focus on the core business domain. The architecture is organized into four distinct layers: **Interfaces**, **Application**, **Domain**, and **Infrastructure**. Each layer has a specific role, ensuring the system is modular, maintainable, and scalable.

### Layered Architecture

1. **Interfaces Layer**  
   - **Purpose**: Serves as the entry point for user interactions, handling HTTP requests and responses.  
   - **Components**:  
     - Controllers (e.g., `CategoryController`)  
     - Data Transfer Objects (DTOs) (e.g., `CategoryRequest`, `CategoryResponse`)  
   - **Responsibility**: Receives user inputs, passes them to the Application layer, and returns responses to the client.

2. **Application Layer**  
   - **Purpose**: Coordinates business workflows and use cases, acting as a bridge between the Interfaces and Domain layers.  
   - **Components**:  
     - Application Services (e.g., `CategoryService`)  
   - **Responsibility**: Manages transactions, validates business rules, and orchestrates domain logic without containing the core business rules itself.

3. **Domain Layer**  
   - **Purpose**: Encapsulates the core business logic, rules, and data models.  
   - **Components**:  
     - Entities (e.g., `Category`)  
     - Value Objects  
     - Domain Services  
     - Repository Interfaces (e.g., `CategoryRepository`)  
   - **Responsibility**: Holds the pure business logic and defines the interfaces needed for data access, ensuring the domain remains independent of other layers.

4. **Infrastructure Layer**  
   - **Purpose**: Handles technical implementations, such as database access and external service integrations.  
   - **Components**:  
     - Repository Implementations (e.g., `CategoryRepositoryImpl`)  
     - Database Access (e.g., JPA, JDBC)  
     - External Service Clients  
   - **Responsibility**: Provides concrete implementations for the interfaces defined in the Domain layer, isolating technical concerns.

### Architecture Diagram

The following textual diagram illustrates how the layers interact:

```
+--------------------------------------+
|         Interfaces Layer             |
|  (Controllers, DTOs)                 |
+--------------------------------------+
                ↓
+--------------------------------------+
|         Application Layer            |
|  (Services, Use Cases)               |
+--------------------------------------+
                ↓
+--------------------------------------+
|           Domain Layer               |
|  (Entities, Repository Interfaces)  |
+--------------------------------------+
                ↑
+--------------------------------------+
|        Infrastructure Layer          |
|  (Repository Implementations, DB)   |
+--------------------------------------+
```

- **Downward arrows (↓)**: Indicate the flow of control or dependency (e.g., Interfaces depend on Application).  
- **Upward arrow (↑)**: Shows that the Infrastructure layer implements the repository interfaces defined in the Domain layer.

*For a visual representation, refer to the project documentation or create UML diagrams illustrating these layers and their interactions.*

### How the Layers Interact

1. A user sends a request (e.g., "create a category") via the **Interfaces Layer**.  
2. The **Interfaces Layer** calls the **Application Layer** (e.g., `CategoryService.createCategory()`).  
3. The **Application Layer** uses the **Domain Layer** to create entities and apply business rules.  
4. The **Application Layer** then calls the **Infrastructure Layer** (via repository interfaces) to persist data.  
5. The response flows back up to the user.

### Key Design Patterns and Practices

- **Repository Pattern**: Abstracts data access, allowing the Domain layer to remain independent of persistence details.  
- **Entity Modeling**: Ensures business logic is encapsulated within domain entities.  
- **Service Layer**: Manages application workflows and transactions.  
- **Aggregates**: In Money Keeper, the Category aggregate consists of the Category entity and its associated Icon. This means that any changes to a category and its icon are treated as a single unit, ensuring that updates are atomic and consistent within a transaction.

### Domain Services

Domain Services represent operations or business logic that do not naturally fit within an Entity or Value Object. For example, a service that calculates budget summaries across multiple categories might be implemented as a Domain Service.

Example:

```java
public class BudgetCalculationService {
    public BudgetSummary calculateSummary(List<Category> categories) {
        // Business logic to calculate budget summary
    }
}
```

---

## DDD Implementation in This Backend Project

The Money Keeper backend follows DDD principles with a clear layered architecture:

### Domain Layer
Encapsulates core business logic and rules. For example, the `Category` entity enforces business rules to maintain data integrity. Consider the rule preventing cyclic dependencies, where a category cannot be set as its own parent:

```java
public void setParent(Category parent) {
    if (this.equals(parent)) {
        throw new IllegalArgumentException("A category cannot be its own parent.");
    }
    this.parent = parent;
}
```

This ensures the domain model remains consistent and aligns with business requirements.

### Application Layer
Coordinates domain operations and use cases (e.g., `CategoryService`).

Example snippet of an application service method:

```java
public Category createCategory(CategoryRequest request) {
    // Validate request
    // Create domain entity
    // Persist using repository
}
```

### Infrastructure Layer
Handles technical details like database access (e.g., `CategoryJpaRepository`).

### Interfaces Layer (API)
Exposes functionality via REST APIs (e.g., `CategoryController`).

Example DTOs:

```java
public class CategoryRequest {
    private String name;
    private Long parentId;
    private String type;
    // getters and setters
}

public class CategoryResponse {
    private Long id;
    private String name;
    private String type;
    // getters and setters
}
```

*To better understand the architecture, refer to the following diagrams in the project documentation:*
- *Layered Architecture Diagram: Illustrates the flow from the Interfaces (API) layer to the Application, Domain, and Infrastructure layers.*
- *UML Class Diagram for Category: Shows the Category entity and its relationships with Icon and parent categories.*

---

## Key Design Patterns and Practices

- **Repository Pattern**: Abstracts data access.
- **Entity Modeling**: Encapsulates business data and behavior.
- **Aggregates**: In Money Keeper, the Category aggregate consists of the Category entity and its associated Icon. This means that any changes to a category and its icon are treated as a single unit, ensuring that updates are atomic and consistent within a transaction.
- **Service Layer**: Manages use cases and workflows.
- **Domain Events**: Events that signify something important in the domain has occurred, allowing different parts of the system to react to changes in a decoupled manner. For example, a `CategoryCreated` event could trigger notifications or updates elsewhere in the system.

---

## Testing and Quality Assurance

Testing covers domain logic, repositories, application services, and API endpoints to ensure correctness and robustness.

*Testing strategies in DDD include:*

- *Unit tests* for domain entities, value objects, and domain services to verify business rules and invariants in isolation. For example, testing that a `Category` entity enforces rules like preventing cyclic parent relationships.
- *Unit tests* for application services to verify business workflows and use case logic in isolation, ensuring that services like `CategoryService` correctly coordinate domain operations and transactions.
- *Integration tests* for repositories and infrastructure components to ensure correct data persistence and interaction with external systems, such as database operations through `CategoryRepositoryImpl`.
- *Unit tests* for Interfaces layer components like controllers to verify request handling, validation, and response formatting.
- *Integration tests* for Interfaces layer to validate end-to-end API behavior, including routing, middleware, and error handling, for example through `CategoryControllerTest`.

*Examples from the Money Keeper backend:*

- `CategoryTest` demonstrates unit testing of domain entities, ensuring business rules and invariants are correctly enforced.
- `CategoryServiceTest` shows unit testing of application services with mocked repositories, verifying business workflows and use case logic without external dependencies.
- `CategoryControllerTest` provides unit tests for the Interfaces layer controllers using mocked services, validating request handling, input validation, and response formatting.
- `CategoryRepositoryImplIntegrationTest` and `CategoryApiIntegrationTest` cover integration testing of repositories and API endpoints respectively, ensuring correct data persistence and end-to-end API behavior.

*These tests illustrate why each type of testing is important in a real project:*

- Unit tests catch logic errors early and run quickly, facilitating rapid development and refactoring.
- Integration tests verify that components work together correctly and that external dependencies behave as expected.
- Together, they provide confidence in both the correctness of individual components and the overall system behavior.

*This layered testing approach helps ensure each part of the system behaves correctly both independently and when integrated.*

*To avoid duplication of effort between unit and integration tests:*

- *Unit tests* should focus on core business logic, edge cases, and isolated component behavior.
- *Integration tests* should primarily verify interactions between components and external systems, such as database access and API routing.
- This separation helps maintain efficient test suites that are both fast and comprehensive, reducing redundant coverage while ensuring robustness.

---

## Getting Started with DDD in Money Keeper

If you're new to the project, follow these steps to get up to speed:

1. **Learn the Ubiquitous Language**: Review the glossary in this document and familiarize yourself with terms like Category, Parent, Type, and Icon.
2. **Study the Domain Model**: Examine `Category.java` to understand how business rules are encapsulated in the entity.
3. **Explore Tests**: Look at tests in `CategoryServiceTest` to see how domain rules are verified.
4. **Review Referenced PRs**: Check out PRs like #24 to see practical examples of feature implementations following DDD principles.

*Links to referenced PRs and diagrams can be found in the project documentation for easier navigation.*

---

## References and Further Reading

- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software*, Addison-Wesley, 2003.
- Vaughn Vernon, *Implementing Domain-Driven Design*, Addison-Wesley, 2013.
- https://dddcommunity.org/
- https://martinfowler.com/bliki/DomainDrivenDesign.html

---

This architecture ensures that the Money Keeper backend is robust, flexible, and aligned with DDD principles, providing a solid foundation for future development and growth.
