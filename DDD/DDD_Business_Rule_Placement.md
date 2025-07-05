# Domain-Driven Design (DDD) – Business Rule Placement Training

## Overview
This document explains where to place business rules and validation logic in a DDD-based application, using real-world examples and best practices.

---

## 1. DDD Layer Responsibilities

- **Domain Layer:**
  - Contains entities, value objects, and domain services.
  - Responsible for business rules that can be enforced using only the data within the entity/aggregate.
  - Should be persistence-agnostic (no database or repository access).

- **Application Layer:**
  - Orchestrates domain operations and coordinates between domain objects.
  - Responsible for business rules that require querying other aggregates/entities or external systems (e.g., uniqueness, cross-entity checks).
  - Uses repositories to fetch data needed for validation.

---

## 2. Where to Place Business Rules

### Application Layer
**Use for:**
- Rules that require querying the database or other aggregates/entities.
- Rules that need coordination between multiple domain objects.

**Example:** Unique Account Name
```java
// Application Layer
if (accountRepository.findByAccountName(account.getAccountName()).isPresent()) {
    throw new DuplicateAccountNameException("Account name already exists: " + account.getAccountName());
}
Account account = new Account(...); // Domain handles local rules
```

**Best Practices:**
- Keep orchestration and coordination logic here.
- Use repositories to fetch data needed for validation.
- Throw domain-specific exceptions for business rule violations.
- Do not put persistence or infrastructure logic directly in the domain.

---

### Domain Layer
**Use for:**
- Rules that can be enforced using only the data within the entity/aggregate.
- Invariants that must always hold true for the entity.

**Example:** Balance Must Be Non-Negative
```java
// Domain Layer
public class Account {
    public Account(String name, BigDecimal balance) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name required");
        if (balance.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Balance must be non-negative");
        // ...assign fields
    }
}
```

**Best Practices:**
- Keep entities and value objects free of infrastructure dependencies.
- Enforce invariants in constructors, methods, or domain services.
- Make domain logic explicit and testable in isolation.
- Use exceptions to signal rule violations.

---

## 3. Summary Table

| Layer             | Use for...                                      | Example                        | Best Practice                                      |
|-------------------|-------------------------------------------------|--------------------------------|----------------------------------------------------|
| Application Layer | Rules needing external data or coordination     | Unique email/account name      | Use repositories, orchestrate, throw domain errors |
| Domain Layer      | Rules using only local entity/aggregate data    | Balance >= 0, name not blank   | Enforce in entity/VO, keep persistence-agnostic    |

---

## 4. Key Takeaways
- **Application Layer:** For rules that require querying or coordination (e.g., uniqueness).
- **Domain Layer:** For rules that only need the current object’s data (e.g., field format, invariants).
- This separation keeps your code clean, testable, and true to DDD principles.
