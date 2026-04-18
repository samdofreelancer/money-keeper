# Aggregate Root Pattern Guide

## Overview

An **Aggregate Root** is a Domain-Driven Design (DDD) pattern that defines consistency boundaries in the domain model. It acts as the gateway to a collection of related entities (and value objects) that must be treated as a single unit for the purpose of data changes.

### Key Concepts

| Concept | Definition |
|---------|-----------|
| **Identity** | Unique identifier distinguishing this aggregate from all others |
| **Consistency Boundary** | All objects within the aggregate must be consistent |
| **Entry Point** | External objects only reference the aggregate root, not internal entities |
| **Bounded Context** | Business domain partition containing related aggregates |
| **Invariant** | Business rule that must always be true within the aggregate |

## Problem

In object-oriented systems without clear aggregate boundaries:

- **Confusion**: Unclear which objects must be persisted together
- **Consistency Issues**: Business rules violated because boundaries aren't enforced
- **Tight Coupling**: Services depend on internal implementation details
- **Testing Difficulty**: Hard to test aggregates in isolation
- **Refactoring Risk**: Changes to one aggregate accidentally affect others

## Solution: Aggregate Root Pattern

Define explicit aggregate roots that:

1. **Encapsulate Internal Consistency**: The root ensures all objects within remain consistent
2. **Manage Lifecycle**: The root creates, modifies, and deletes contained entities
3. **Enforce Business Rules**: The root validates invariants before allowing changes
4. **Provide Single Access Point**: External access only through the root's public methods
5. **Reference By Identity**: Other aggregates reference this root by ID, not by object reference

## Money Keeper Aggregate Roots

### 1. Account Aggregate Root

**Purpose**: Manages financial accounts and their state

```java
@AggregateRoot(
    boundedContext = "account",
    description = "Manages financial accounts - bank accounts, wallets, cash storage"
)
public class Account {
    private final Long id;                    // Aggregate Root Identity
    private final AccountName name;           // Value Object
    private final Money initialBalance;       // Value Object
    private final AccountType type;           // Entity (Enum)
    private final String description;         // Primitive
    private final boolean active;             // State
    
    // Consistency Boundary: Everything within this aggregate must be valid
    // Invariants:
    // - Account name must be unique (enforced at repository level)
    // - Initial balance is immutable
    // - Type must be valid
}
```

**Responsibilities**:
- Maintain account identity and state
- Validate account data
- Manage active/inactive status
- Enforce value object constraints

**Boundaries**:
- External code only references Account by ID
- Changes to account go through Account methods
- Service layer coordinates between aggregates (Account ↔ Category, Account ↔ Transaction)

### 2. Category Aggregate Root

**Purpose**: Manages transaction categories with hierarchical support

```java
@AggregateRoot(
    boundedContext = "category",
    description = "Manages transaction categories supporting hierarchy"
)
public class Category {
    private final Long id;                    // Aggregate Root Identity
    private String name;                      // State
    private String icon;                      // State
    private CategoryType type;                // State
    private Category parent;                  // Reference (can be null)
    
    // Consistency Boundary
    // Invariants:
    // - Category cannot be its own parent (prevents cycles)
    // - Name should be meaningful
    // - Type must be valid (Income, Expense, etc.)
}
```

**Responsibilities**:
- Maintain category identity
- Support hierarchical organization
- Enforce no-cyclic-parent rule
- Manage category metadata

**Example Usage**:
```java
// Create parent category
Category food = new Category("Food", "🍔", CategoryType.EXPENSE, null);

// Create child category
Category restaurants = new Category("Restaurants", "🍽", CategoryType.EXPENSE, food);

// Prevent cycles - this should throw exception
food.setParent(food);  // ❌ IllegalArgumentException

// Creating a transaction requires referencing category by root
// NOT accessing internal entities directly
transactionService.createTransaction(accountId, categoryId, amount);
```

### 3. AppSettings Aggregate Root

**Purpose**: Manages application-wide configuration

```java
@AggregateRoot(
    boundedContext = "settings",
    description = "Manages application-wide settings and defaults"
)
public class AppSettings {
    private Long id;                          // Aggregate Root Identity (singleton ID = 1)
    private String defaultCurrency;           // State
    
    // Consistency Boundary
    // Invariants:
    // - Only one instance typically exists
    // - Default currency must be valid
}
```

**Responsibilities**:
- Maintain application configuration
- Provide global defaults
- Ensure consistency of settings

**Example Usage**:
```java
// Load singleton settings
AppSettings settings = settingsRepository.getSettings(1L);

// Update defaults
settings.setDefaultCurrency("EUR");
settingsRepository.save(settings);

// Use in service layer
String defaultCurrency = settings.getDefaultCurrency();
```

## Design Patterns

### Aggregate with Value Objects

```java
// GOOD: Aggregate root with value objects
@AggregateRoot
public class Account {
    private final Long id;
    private final AccountName name;    // Value Object - immutable
    private final Money balance;       // Value Object - immutable
    
    public void validateConsistency() {
        if (name == null) throw new IllegalStateException("Name required");
        if (balance == null) throw new IllegalStateException("Balance required");
    }
}
```

### No Direct Entity References Between Aggregates

```java
// ❌ BAD: Creating circular dependencies between aggregates
@AggregateRoot
public class Account {
    private List<Category> categories;  // ❌ Don't do this!
}

// ✅ GOOD: Use ID references between aggregates
@AggregateRoot
public class Category {
    private Long id;
    private String name;
    // Reference Account by ID when needed
    // Don't create a field for it
}

// Coordination happens in service layer:
public class TransactionService {
    public void createTransaction(Long accountId, Long categoryId, Amount amount) {
        Account account = accountRepository.findById(accountId);
        Category category = categoryRepository.findById(categoryId);
        // Validate both aggregates are valid
        // Creates transaction referencing both by ID
    }
}
```

### Aggregate with Lifecycle Management

```java
@AggregateRoot
public class Account {
    private Long id;
    private boolean active;
    
    // Invariant: Only active accounts can be modified
    public void updateBalance(Money newBalance) {
        if (!active) {
            throw new IllegalStateException("Cannot modify inactive account");
        }
        // Proceed with update
    }
    
    // Lifecycle management through public methods
    public void activate() {
        this.active = true;
    }
    
    public void deactivate() {
        this.active = false;
    }
}
```

## When to Use Aggregate Root

### ✅ Use Aggregate Root When

1. **Clear Consistency Boundary**: Group of entities must remain consistent together
2. **Shared Identity**: Objects are identified together, not separately
3. **Complex Business Logic**: Rules involving multiple entities
4. **Transactional Integrity**: Changes must be atomic

### ❌ Don't Use Aggregate Root When

1. **Simple Value Objects**: Immutable objects identified by their values
2. **Independent Entities**: Objects that stand alone with no dependencies
3. **Reference Data**: Static lookup values (rarely change)
4. **Query Objects**: Read-only projections for reporting

## Common Problems and Solutions

### Problem 1: Aggregate Too Large

**Symptom**: Slow updates, large database transactions, high memory usage

**Solution**: Split into smaller aggregates
```java
// ❌ TOO LARGE: One aggregate for entire account lifecycle
@AggregateRoot
public class Account {
    private List<Transaction> allTransactions;    // ❌ Don't include all
    private List<SettlementRecords> settlements;  // ❌ Separate aggregate
    // ... dozens more fields
}

// ✅ CORRECT: Separate aggregates
@AggregateRoot
public class Account {
    private Long id;
    private String name;
    // ... only account-related fields
}

@AggregateRoot
public class TransactionLog {
    private Long id;
    private Long accountId;  // Reference by ID
    private List<Transaction> transactions;
}
```

### Problem 2: Circular Dependencies Between Aggregates

**Symptom**: Cannot persist aggregates without circular references

**Solution**: Use ID references and service layer coordination
```java
// ❌ WRONG: Circular reference
@AggregateRoot
public class Account {
    private Set<Category> usedCategories;  // Reference to Category aggregate
}

@AggregateRoot
public class Category {
    private Long accountId;  // Reference back to Account
}

// ✅ CORRECT: ID references only
@AggregateRoot
public class Account {
    private Long id;
    // Don't reference Category aggregate directly
}

@AggregateRoot
public class Category {
    private Long id;
    // Don't reference Account directly
}

// Coordination at service level:
public class CategoryService {
    public List<Category> getCategoriesForAccount(Long accountId) {
        // Query categories by accountId
        return categoryRepository.findByAccountId(accountId);
    }
}
```

### Problem 3: Violating Aggregate Boundaries

**Symptom**: Service layer accessing internal entities, inconsistent updates

**Solution**: Only expose aggregate root, enforce through methods
```java
// ❌ WRONG: Exposing internal entities
@AggregateRoot
public class Account {
    public Money getBalance() {
        return balance;
    }
    
    public void setBalance(Money newBalance) {  // ❌ Bypasses validation
        this.balance = newBalance;
    }
}

// Usage - bypasses business rules
account.setBalance(Money.of(BigDecimal.ZERO, "USD"));  // Direct assignment

// ✅ CORRECT: Enforce through meaningful methods
@AggregateRoot
public class Account {
    public Money getBalance() {
        return balance;
    }
    
    // No public setter - must use domain methods that enforce rules
    
    public void transferOut(Money amount) {
        if (balance.compareTo(amount) < 0) {
            throw new InsufficientFundsException();
        }
        // Only valid domain operations allowed
    }
}

// Usage - enforces business rules
account.transferOut(Money.of(BigDecimal.valueOf(100), "USD"));
```

## Best Practices

### 1. Explicit Aggregate Boundaries

```java
// Mark all aggregate roots clearly
@AggregateRoot(
    boundedContext = "account",
    description = "..."
)
public class Account { }

// Make internal entities clear
public class Transaction {  // Internal to TransactionLog aggregate
    private final Long id;
    // ...
}
```

### 2. Enforce Consistency Through Methods

```java
@AggregateRoot
public class Category {
    private Category parent;
    
    // ✅ GOOD: Method enforces business rule
    public void setParent(Category newParent) {
        if (this.equals(newParent)) {
            throw new IllegalArgumentException("Cannot be own parent");
        }
        this.parent = newParent;
    }
    
    // ❌ BAD: Direct field access bypasses validation
    public Category getParent() { return parent; }
}
```

### 3. Reference Other Aggregates by ID

```java
@AggregateRoot
public class Category {
    private Long id;
    private String name;
    
    // ❌ WRONG: Holds reference to other aggregate
    // private Account account;
    
    // ✅ CORRECT: Reference by ID only
    // Don't store account reference at all
}

// In service layer, query as needed:
public Class getCategoriesForAccount(Long accountId) {
    return categoryRepository.findByAccountId(accountId);
}
```

### 4. Document Aggregate Consistency Rules

```java
/**
 * Aggregate Root representing...
 * 
 * <p>Consistency Rules (Invariants):</p>
 * <ul>
 *   <li>Category cannot be its own parent</li>
 *   <li>Name must be non-empty</li>
 *   <li>Type must be valid value</li>
 * </ul>
 */
@AggregateRoot
public class Category { }
```

### 5. Keep Aggregates Small

```java
// ✅ GOOD: Small, focused aggregate
@AggregateRoot
public class Account {
    private Long id;
    private String name;
    private Money balance;
    // ~10-15 fields, focused on single responsibility
}

// ❌ BAD: Large aggregate doing too much
@AggregateRoot
public class MegaAggregate {  // 100+ fields, multiple responsibilities
    private Account account;
    private List<Transactions> transactions;
    private List<Categories> categories;
    private Settings settings;
    // ... many more
}
```

## Testing Aggregate Roots

### Unit Tests

```java
@Test
void testCategoryCannotBeOwnParent() {
    Category category = new Category("Food", "🍔", EXPENSE, null);
    
    assertThrows(IllegalArgumentException.class, 
        () -> category.setParent(category));
}

@Test
void testAccountActivation() {
    Account account = new Account(name, balance, type, desc);
    
    assertTrue(account.isActive());
    
    account.deactivate();
    assertFalse(account.isActive());
}
```

### Integration Tests

```java
@Test
void testAggregatesBoundaryIsolation() {
    Account account = new Account(name, balance, type, desc);
    Category category = new Category("Income", "💰", INCOME, null);
    
    // Each aggregate maintains independent state
    assertTrue(account.isActive());
    assertNotNull(category.getName());
}
```

## Monitoring and Validation

### Code Review Checklist

- [ ] All aggregates marked with `@AggregateRoot` annotation
- [ ] Aggregate has clear identity (id field)
- [ ] Business invariants documented
- [ ] No field holding references to other aggregates
- [ ] Boundary enforced through public methods
- [ ] Consistency rules validated before state changes

### Architecture Tests

```java
/**
 * Can implement to automatically validate:
 *   - All @AggregateRoot classes have id field
 *   - No field types are other @AggregateRoot classes
 *   - Service methods use aggregate roots as entry points
 */
@Test
void testAggregateBoundaryViolations() {
    // Scan architecture for violations
}
```

## Extending This Pattern

### Adding More Aggregates

When creating a new aggregate:

1. Identify the consistency boundary
2. Define invariants (business rules)
3. Create aggregate root class with `@AggregateRoot`
4. Make internals private, expose through methods
5. Reference other aggregates by ID only
6. Write integration tests for boundaries
7. Document in ADR if adding new bounded context

### Aggregate Evolution

```java
// Monitor for aggregates that should be split:
// - Growing beyond 20 fields
// - Multiple independent responsibilities
// - Frequent null checks
// - Complex business logic

// Consider splitting into separate aggregates!
```

## FAQ

**Q: Should aggregate root always have an ID field?**  
A: Yes. Identity is what makes something an aggregate root vs. a value object.

**Q: Can aggregate contain other entities?**  
A: Yes, but they must be internal to the aggregate, not referenced externally.

**Q: How do we handle querying across aggregates?**  
A: Service layer queries each aggregate separately and combines results.

**Q: What if I need to update two aggregates together?**  
A: Use a service method that updates both (potentially in a transaction), but don't create circular references.

**Q: Can I have computed properties on aggregates?**  
A: Yes, but ensure they don't violate consistency rules.

## References

- **Domain-Driven Design** - Eric Evans
- **Implementing Domain-Driven Design** - Vaughn Vernon  
- **Aggregate Pattern** - Martin Fowler
- [Aggregate Pattern Guide](https://www.domaindriven Designs.org/)

---

**Last Updated**: 2026-04-18  
**Related ADRs**: ADR-001 (Layered Architecture), ADR-002 (Anti-Corruption Layer)
