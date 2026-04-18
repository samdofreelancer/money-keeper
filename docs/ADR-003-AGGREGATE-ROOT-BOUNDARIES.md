# ADR-003: Formal Aggregate Root Marking and Documentation

**Status**: Accepted  
**Date**: 2026-04-18  
**Deciders**: Ginseng, Development Team  
**Affects**: Architecture, Domain Model, Development Guidelines  

## Context

Aggregate roots are correctly implemented throughout the Money Keeper codebase but lack formal marking and documentation. This creates several challenges:

1. **Discovery Problem**: New team members cannot easily identify which classes are aggregate roots
2. **Consistency Issue**: No standard way to mark aggregates across the codebase
3. **Documentation Gap**: Business rationale for aggregate boundaries not captured
4. **Onboarding Friction**: Requires multiple code reviews to understand domain model structure
5. **Maintenance Risk**: Future developers might inadvertently violate aggregate boundaries

## Decision

We adopt a multi-part approach to formally document and mark aggregate root boundaries:

1. **Create `@AggregateRoot` annotation** in the shared domain layer with:
   - Metadata for bounded context identification
   - Description field documenting aggregate responsibilities
   - JavaDoc explaining DDD aggregate concepts
   - SOURCE retention (compile-time validation)

2. **Mark all identified aggregate roots** with the annotation:
   - Account (account bounded context)
   - Category (category bounded context)
   - AppSettings (settings bounded context)

3. **Create comprehensive documentation** including:
   - Integration tests validating aggregate boundaries
   - Architecture Decision Record (this document)
   - Pattern documentation with code examples
   - README sections explaining aggregate concepts

4. **Establish team consensus** on aggregate root identification criteria:
   - Must have unique identity (id field)
   - Responsible for consistency of contained entities/value objects
   - External objects hold references only to the root
   - Manages lifecycle of contained objects

## Rationale

### Why Annotation Instead of JavaDoc Convention

| Approach | Advantages | Disadvantages |
|----------|-----------|-----------------|
| **@AggregateRoot Annotation** | Discoverable via reflection, Toolable, Explicit intent, IDE support | Requires new annotation <br/> Small compile-time overhead |
| **JavaDoc Convention** | Lightweight, No Java overhead | Not discoverable by tools, Hard to enforce |
| **No Marking** | Minimal overhead | Hidden knowledge, Requires code review |

**Decision**: Annotation provides best balance of discoverability, toolability, and explicit intent.

### Why These Aggregates

**Account Aggregate Root**
- Manages account identity and state
- Contains account metadata (name, type, balance)
- Enforces business rules (unique names, active/inactive status)
- External objects reference accounts by ID, not direct pointers

**Category Aggregate Root**
- Manages category identity and hierarchy
- Contains category metadata (name, icon, type)
- Enforces business rules (no cyclic parents)
- Supports hierarchical organization

**AppSettings Aggregate Root**
- Manages application configuration
- Singleton pattern (typically one instance)
- Provides global defaults
- Separates configuration concerns from domain logic

**Not Marked as Aggregate Roots**
- **TaxBracket**: Value object (immutable, identified by value)
- **Transaction**: Not yet implemented in current analysis
- **Money**, **CurrencyCode**: Value objects

## Implementation Steps

### Step 1: Create Annotation
```bash
# Location: src/main/java/com/personal/money/management/core/shared/domain/AggregateRoot.java
# Features:
# - @Target(ElementType.TYPE)
# - boundedContext metadata
# - description field
# - comprehensive JavaDoc with examples
```

### Step 2: Mark Aggregate Roots
```java
@AggregateRoot(
    boundedContext = "account",
    description = "Manages financial accounts..."
)
public class Account { ... }

@AggregateRoot(
    boundedContext = "category",
    description = "Manages transaction categories..."
)
public class Category { ... }

@AggregateRoot(
    boundedContext = "settings",
    description = "Manages application settings..."
)
public class AppSettings { ... }
```

### Step 3: Add Integration Tests
```bash
# Location: src/test/java/.../AggregateRootBoundaryTest.java
# Coverage:
# - Annotation presence verification
# - Identity management tests
# - Boundary enforcement tests
# - Isolation tests
```

### Step 4: Create Documentation
```bash
# ADR-003: This document (architecture decision)
# AGGREGATE_ROOTS_PATTERN.md: Pattern guide and examples
# README updates: Team guidelines
```

## Consequences

### Positive
✅ **Improved Developer Experience**: New team members can easily identify aggregates  
✅ **Automated Tooling**: Reflection-based tools can discover and validate aggregates  
✅ **Explicit Intent**: Annotations make architectural decisions visible in code  
✅ **IDE Support**: IDEs can provide autocomplete and navigation for annotated classes  
✅ **Documentation**: Annotation metadata documents aggregate responsibilities  
✅ **Design Consistency**: Enforces consistent handling of aggregate boundaries  
✅ **Extensibility**: Easy to add reflection-based validation or architecture testing  

### Negative
⚠️ **Compile-Time Overhead**: Slight increase in compilation time (negligible for modern JVMs)  
⚠️ **Annotation Spread**: Adds annotations throughout the codebase (necessary for clarity)  

## Monitoring and Validation

### Code Review Checklist
- [ ] All new aggregate roots have `@AggregateRoot` annotation
- [ ] Annotation metadata (boundedContext, description) is accurate
- [ ] Aggregate boundaries are enforced in service layer
- [ ] External objects reference aggregates only through their roots
- [ ] Value objects within aggregates are immutable

### Architecture Tests
```java
// Can be implemented to automatically verify:
- All classes with ID field are marked as @AggregateRoot
- No circular references between aggregates
- Service methods use aggregate roots as entry points
- Value objects are properly immutable
```

### Future Tooling
- **Static Analysis**: Scan for unmarked aggregates (classes with ID fields)
- **Architecture Tests**: Validate ArchUnit rules for aggregate boundaries
- **Documentation Generation**: Auto-generate domain model diagrams from annotations
- **Reflection-Based Validation**: Runtime checks for aggregate consistency

## Related Decisions

**ADR-001**: Layered Architecture  
→ This ADR clarifies domain layer organization within the architecture

**ADR-002**: Anti-Corruption Layer Pattern  
→ Protects aggregates from external system corruption

**AGGREGATE_ROOTS_PATTERN.md**: Design Guide  
→ Provides practical examples and patterns for working with aggregates

## References

- [Domain-Driven Design](https://www.domaindriven Design.org/) - Eric Evans
- [Aggregate Pattern](https://martinfowler.com/bliki/DDD_Aggregate.html) - Martin Fowler
- [Implementing Domain-Driven Design](https://vaughnvernon.com/books/iddd/) - Vaughn Vernon
- [Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html) - Martin Fowler

## Future Enhancements

1. **Implement @AggregateIdentity annotation**  
   - Mark ID fields explicitly
   - Validate ID is unique and immutable

2. **Create @Entity and @ValueObject annotations**  
   - Clarify role of each class within aggregates
   - Enable comprehensive architecture validation

3. **Add ArchUnit Rules**  
   - Validate aggregate boundaries at compile time
   - Enforce unidirectional dependencies

4. **Generate Architecture Documentation**  
   - Auto-generate Plantseed diagrams from aggregates
   - Create domain model documentation from annotations

5. **Implement Aggregate Validation Framework**  
   - Runtime validation of aggregate consistency
   - Audit trail for aggregate changes

## Questions and Answers

**Q: What about existing code without aggregates?**  
A: Future bounded contexts will be designed with clear aggregate roots from the start. Refactoring existing code is outside this ADR's scope but documented in AGGREGATE_ROOTS_PATTERN.md.

**Q: How do we handle circular dependencies between aggregates?**  
A: Aggregates should not have circular dependencies. If discovered, the model should be refactored. See AGGREGATE_ROOTS_PATTERN.md for patterns.

**Q: Can an aggregate contain another aggregate?**  
A: No. If needed, reference the other aggregate root by ID only, not by direct object reference.

**Q: What retention policy should the annotation use?**  
A: SOURCE retention is used since this is primarily for development-time documentation and reflection. Runtime retention can be added if needed for validation.

---

**Approved by**: Ginseng (Architecture Lead)  
**Last Updated**: 2026-04-18
