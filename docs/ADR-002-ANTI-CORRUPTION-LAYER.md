# ADR-002: Anti-Corruption Layer for External Integrations

## Status
Accepted

## Context

The Money Keeper project needs to integrate with external systems:
- **Exchange Rate Services** (for currency conversion)
- **Tax Authority Services** (for tax calculations)
- **Potentially other services** in the future (payment processors, bank APIs, etc.)

Without a clear boundary pattern, these external integrations risk:
1. Corrupting the internal domain model with external concepts
2. Creating tight coupling to specific external APIs
3. Making it difficult to test domain logic
4. Making it hard to switch providers later

## Decision

We will implement the **Anti-Corruption Layer (ACL)** pattern as the standard approach for all external integrations.

The ACL pattern creates a clear boundary between:
- **Domain layer** (pure business logic, domain models)
- **Infrastructure layer** (external service integrations)

### Key Components

1. **Adapter Interfaces** (in `shared.infrastructure.adapter`)
   - `ExchangeRateAdapter`
   - `TaxAuthorityAdapter`
   - Any future external integrations

2. **Adapter Implementations**
   - Production implementations (HTTP, gRPC, etc.)
   - Stub/Mock implementations (for testing)

3. **Domain isolation**
   - Domain services depend on adapter abstractions
   - External service details hidden in adapter implementations

## Rationale

### Why Anti-Corruption Layer Pattern?

1. **Domain Purity**: Domain logic remains independent of external concerns
2. **Flexibility**: Easy to swap adapter implementations without domain changes
3. **Testability**: Domain logic can be tested with stub adapters
4. **Maintainability**: Clear separation makes code easier to understand
5. **Scalability**: Pattern scales to many external integrations
6. **DDD Alignment**: Consistent with Domain-Driven Design principles

### Why Not Other Approaches?

1. **Direct API calls in domain**: ❌ Violates separation of concerns
2. **Direct dependency injection**: ❌ Creates tight coupling
3. **Global service locator**: ❌ Makes dependencies implicit
4. **Event-driven integration**: ❌ Overkill for synchronous operations

## Implementation

### Step 1: Define Adapter Interface
Create interface in `shared.infrastructure.adapter` that represents what the domain needs from external service.

### Step 2: Create Implementations
- **Production**: HTTP client, response mapping, error handling
- **Stub**: Hardcoded test data, no external dependencies

### Step 3: Inject into Domain Services
Domain services receive adapter as constructor dependency.

### Step 4: Use in Domain Logic
Domain services call adapter methods to get external data, operate on transformed data.

## Architecture

```
DOMAIN LAYER
    ↑
    ↓ (depends on)
ADAPTER INTERFACES (ExchangeRateAdapter, TaxAuthorityAdapter)
    ↑
    ↓ (implements)
ADAPTER IMPLEMENTATIONS (RestExchangeRateAdapter, StubExchangeRateAdapter)
    ↑
    ↓ (calls)
EXTERNAL SYSTEMS (APIs, Services)
```

## Consequences

### Positive
✅ Domain remains pure and testable
✅ External changes don't impact domain code
✅ Easy to mock in unit tests
✅ Clear, explicit integration points
✅ Supports multiple implementations (test, prod, fallback)
✅ Facilitates provider switching
✅ Easier onboarding for new team members

### Negative
⚠️ Adds abstraction layer (extra code)
⚠️ Requires disciplined implementation (avoid leaking external models)
⚠️ Initial setup cost (create adapter, implement twice)

## Monitoring & Validation

1. **Code Review Checklist**:
   - Domain code has no direct external API calls
   - All external integrations go through adapter interfaces
   - Adapters properly translate external responses

2. **Architecture Tests**:
   - Verify domain layer doesn't import infrastructure
   - Verify adapters don't leak external models

3. **Documentation**:
   - Each adapter documented with external service details
   - Integration examples provided

## Related Decisions

- ADR-001: Layered Architecture with DDD (Domain, Application, Infrastructure)
- ADR-003: Value Objects for Currency and Tax (uses ACL for external rates/brackets)

## References

- DDD: Anti-Corruption Layer pattern
- Martin Fowler: Strangler Fig Pattern (for gradual migration)
- Clean Architecture: External systems as boundaries
- SOLID: Dependency Inversion Principle

## Future Enhancements

1. **Circuit Breaker**: Add circuit breaker pattern for resilience
2. **Caching**: Cache external data (exchange rates, tax brackets)
3. **Fallback**: Provide fallback implementations when service unavailable
4. **Retry Logic**: Automatic retry with exponential backoff
5. **Metrics**: Track adapter performance, error rates

## Decision Date
April 18, 2026

## Decided By
Architecture Team
