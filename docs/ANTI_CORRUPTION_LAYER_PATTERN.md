# Anti-Corruption Layer Pattern

## Overview

The Anti-Corruption Layer (ACL) is a DDD pattern that provides a boundary between our internal domain model and external systems (third-party APIs, legacy systems, microservices, etc.). It prevents external models and concepts from "corrupting" our domain logic.

## Problem

When integrating with external systems, there are several risks:

1. **Domain Corruption**: External system structures leak into domain logic
2. **Tight Coupling**: Changes in external APIs force changes in domain code
3. **Mixed Concerns**: Domain code becomes tangled with integration details
4. **Testing Difficulty**: Hard to test domain logic without external dependencies
5. **Long-term Maintenance**: Domain becomes harder to understand and modify

## Solution

The Anti-Corruption Layer creates a boundary using **Adapters** that:

1. **Isolate** external service calls into a dedicated infrastructure layer
2. **Translate** external models into internal domain models
3. **Validate** data transformations to maintain domain invariants
4. **Provide** a stable interface that shields domain from external changes

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                          │
│  (Account, Transaction, Tax, Exchange domains)           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ (depends on abstractions, not implementations)
┌─────────────────────────────────────────────────────────┐
│        ANTI-CORRUPTION LAYER (Adapter Interfaces)        │
│  - ExchangeRateAdapter                                   │
│  - TaxAuthorityAdapter                                   │
│  - Any future external integrations                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ (implements adapters)
┌─────────────────────────────────────────────────────────┐
│            INFRASTRUCTURE/EXTERNAL LAYER                 │
│  - RestExchangeRateAdapter (calls OpenExchangeRates)     │
│  - RestTaxAuthorityAdapter (calls tax service)           │
│  - Mock/Stub implementations for testing                 │
│  - HTTP clients, serializers, mappers                    │
└─────────────────────────────────────────────────────────┘
                 │
                 ↓ (makes HTTP calls)
┌─────────────────────────────────────────────────────────┐
│            EXTERNAL SYSTEMS (Outside Scope)              │
│  - OpenExchangeRates API                                 │
│  - Tax Authority APIs                                    │
│  - Third-party services                                  │
└─────────────────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Define Adapter Interface (Infrastructure Layer)

Create interfaces that represent external services from the domain's perspective:

```java
public interface ExchangeRateAdapter {
    BigDecimal getExchangeRate(String source, String target, LocalDate date);
    boolean isAvailable();
}
```

### 2. Implement Multiple Adapters

Create different implementations for different scenarios:

#### Production Adapter
```java
@Component
public class RestExchangeRateAdapter implements ExchangeRateAdapter {
    // Calls actual external API
    // Transforms external response to internal format
    // Handles errors gracefully
}
```

#### Stub/Mock Adapter
```java
public class StubExchangeRateAdapter implements ExchangeRateAdapter {
    // Hardcoded rates for testing/development
    // No external dependencies
}
```

### 3. Inject Adapter into Domain Services

Domain services depend on the adapter abstraction, not implementation:

```java
@Service
public class ExchangeService {
    private final ExchangeRateAdapter exchangeRateAdapter;
    
    public ExchangeService(ExchangeRateAdapter exchangeRateAdapter) {
        this.exchangeRateAdapter = exchangeRateAdapter;
    }
    
    public Money convertCurrency(Money money, String targetCurrency) {
        BigDecimal rate = exchangeRateAdapter.getExchangeRate(
            money.getCurrency().getCode(),
            targetCurrency,
            LocalDate.now()
        );
        return new Money(
            money.getAmount().multiply(rate),
            CurrencyCode.of(targetCurrency)
        );
    }
}
```

## Benefits

### For Domain Logic
- **Stable Abstractions**: Domain depends on interfaces, not external implementations
- **Focused Logic**: Domain code stays pure and business-focused
- **Easy Testing**: Easy to mock adapters in unit tests
- **Clear Contracts**: Interfaces explicitly define integration points

### For External Integration
- **Flexible Implementation**: Can swap implementations without domain changes
- **Graceful Degradation**: Easy to add fallbacks or circuit breakers
- **Error Handling**: External errors translated to domain exceptions
- **Version Management**: Can upgrade external APIs without domain impact

### For Team Maintenance
- **Clear Boundaries**: Everyone knows where integration happens
- **Documentation**: Adapter interfaces document what external systems provide
- **Future Proof**: New team members can quickly understand integration architecture
- **Scalability**: Easy to add more external integrations following same pattern

## Real-World Examples

### Example 1: Exchange Rate Service

**External API Response**:
```json
{
  "rates": {
    "VND": 24500,
    "EUR": 0.95
  },
  "base": "USD",
  "date": "2026-04-18"
}
```

**ACL Transforms to**:
```java
BigDecimal rate = exchangeRateAdapter.getExchangeRate("USD", "VND", date);
// Returns: BigDecimal.valueOf(24500)
```

**Domain uses value object**:
```java
Money exchanged = Money.of(BigDecimal.valueOf(100), CurrencyCode.of("USD"))
    .convertTo("VND", exchangeRateAdapter);
// Result: 2,450,000 VND
```

### Example 2: Tax Authority Service

**External API Response**:
```json
{
  "jurisdiction": "vn",
  "income": 10000000,
  "taxRate": 0.15,
  "brackets": [...]
}
```

**ACL Transforms to**:
```java
BigDecimal rate = taxAuthorityAdapter.getEffectiveTaxRate("vn", income, date);
// Returns: BigDecimal.valueOf(0.15)
```

**Domain uses for calculation**:
```java
BigDecimal taxAmount = annualIncome.multiply(taxRate);
TaxCalculation calculation = new TaxCalculation(annualIncome, taxRate, taxAmount);
```

## When to Use Anti-Corruption Layer

### Use ACL When:
✅ Integrating with external APIs or services  
✅ Connecting to legacy systems  
✅ Using third-party microservices  
✅ Interacting with government/authority systems  
✅ Integration might change or be replaced  
✅ Multiple implementations might be needed (test vs. production)

### Don't Use ACL When:
❌ Internal system-to-system calls (use domain events instead)  
❌ Simple library usage (JSON parsing, collections, etc.)  
❌ Framework abstraction (Spring, ORM is fine)

## Extension Points

### Future Integrations

When adding new external integrations, follow this pattern:

1. **Create adapter interface** in `shared.infrastructure.adapter`
2. **Define domain objects** it will work with
3. **Implement production adapter** (HTTP, gRPC, etc.)
4. **Implement stub/mock** for testing
5. **Add tests** demonstrating the transformation
6. **Document** with comments like these

### Popular Services Ready for ACL

- **Exchange Rates**: OpenExchangeRates, Fixer.io, CurrencyLayer
- **Tax Information**: TaxJar, Avalara, government tax APIs
- **Payment Processing**: Stripe, PayPal, Square
- **Bank Integration**: Plaid, TrueLayer, open banking APIs
- **Analytics**: Mixpanel, Segment, Vizable

## Testing Strategy

### Unit Tests (Domain Logic)
- Mock the adapter interface
- Test business logic with various adapter responses
- No external dependencies needed

### Integration Tests (ACL)
- Test adapter implementations with actual services
- Can use stub implementations with test data
- Verify transformation correctness
- Handle error scenarios

```java
class ExchangeRateAdapterIntegrationTest {
    
    private ExchangeRateAdapter adapter = new StubExchangeRateAdapter();
    
    @Test
    void shouldTransformExternalRateToInternalModel() {
        BigDecimal rate = adapter.getExchangeRate("USD", "VND", LocalDate.now());
        assertTrue(rate.compareTo(ZERO) > 0);
    }
    
    @Test
    void shouldHandleUnavailableService() {
        assertThrows(ExchangeRateException.class, () ->
            adapter.getExchangeRate("XXX", "YYY", LocalDate.now())
        );
    }
}
```

## Common Mistakes to Avoid

### ❌ Leaking External Models
```java
// WRONG: External model leaks into domain
Account account = new Account(openApiResponse.toAccount());

// RIGHT: Transform at boundary
Account account = new Account(
    AccountName.of(adaptToInternalName(externalResponse)),
    ...
);
```

### ❌ No Error Handling
```java
// WRONG: External errors propagate up
return externalService.getRate().getBigDecimal();

// RIGHT: Translate to domain exception
try {
    return externalService.getRate().getBigDecimal();
} catch (ExternalServiceException e) {
    throw new ExchangeRateException("Failed to fetch rate", e);
}
```

### ❌ Bidirectional Dependency
```java
// WRONG: Domain depends on external
public class Account {
    private ExternalAccountDTO dto;  // ❌ External model in domain
}

// RIGHT: Unidirectional dependency
public class Account {
    private AccountName name;  // ✅ Domain model
    private Money balance;      // ✅ Domain model
}
```

### ❌ Complex Adapter Logic
```java
// WRONG: Business logic in adapter
public BigDecimal getRate(...) {
    BigDecimal rate = api.getRate();
    if (rate < 0) rate = getHistoricalRate();  // ❌ Business logic
    return rate;
}

// RIGHT: Adapter only transforms
public BigDecimal getRate(...) {
    return api.getRate();  // ✅ Simple transformation
}
```

## Summary

The Anti-Corruption Layer pattern provides:

1. **Clear Boundary** between domain and external systems
2. **Stable Interface** that shields domain from external changes
3. **Testability** by enabling easy mocking
4. **Flexibility** to swap implementations
5. **Maintainability** through clear separation of concerns
6. **Documentation** via adapter interfaces

By applying this pattern consistently, the Money Keeper project can integrate with any external service while keeping the domain model clean, focused, and maintainable.
