# Account Use Cases Migration Guide

This guide explains the migration from the old factory-based approach to the new DDD-compliant structure.

## Old Structure Issues

### 1. **Factory Anti-Pattern**
```typescript
// OLD - Factory creating anonymous objects
createSetupAccountManagementUseCase() {
  return {
    execute: async () => {
      // Mixed concerns: setup, API calls, UI interactions
    }
  };
}
```

### 2. **Mixed Responsibilities**
- Use cases handling infrastructure concerns
- No clear separation between commands and queries
- Business logic scattered across multiple places

### 3. **Poor Error Handling**
- Generic Error objects without context
- No domain-specific error types
- Inconsistent error handling patterns

## New Structure Benefits

### 1. **Command/Query Separation**
```typescript
// NEW - Clear separation of concerns
export class CreateAccountCommand implements UseCase<CreateAccountRequest, CreateAccountResponse> {
  async execute(request: CreateAccountRequest): Promise<CreateAccountResponse> {
    // Pure business logic
  }
}

export class GetAccountListQuery implements UseCase<GetAccountListRequest, GetAccountListResponse> {
  async execute(request: GetAccountListRequest): Promise<GetAccountListResponse> {
    // Pure query logic
  }
}
```

### 2. **Application Service Orchestration**
```typescript
// NEW - Clean service layer
export class AccountApplicationService {
  async createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse> {
    return await this.createAccountCommand.execute(request);
  }
}
```

### 3. **Domain-Driven Error Handling**
```typescript
// NEW - Rich domain errors
export class ValidationError extends AccountError {
  readonly type = "validation";
}

export class DomainError extends AccountError {
  readonly type = "domain";
}
```

## Migration Steps

### Step 1: Update Factory Usage
```typescript
// OLD
const useCasesFactory = new AccountUseCasesFactory(undefined, world);
const useCase = useCasesFactory.createSetupAccountManagementUseCase();

// NEW
const factory = new AccountApplicationFactory(world);
const service = factory.getAccountApplicationService();
```

### Step 2: Update Step Definitions
```typescript
// OLD
const flowUseCase = this.getUseCasesOrThrow().createBankAccountFlowUseCase();
const result = await flowUseCase.execute(request);

// NEW
const service = this.getAccountApplicationService();
const result = await service.createAccount(request);
```

### Step 3: Update Error Handling
```typescript
// OLD
switch (result.type) {
  case "success":
    // handle success
  case "validation_error":
    // handle error
}

// NEW
if (result.success) {
  // handle success
} else {
  switch (result.error?.type) {
    case "validation":
      // handle validation error
    case "domain":
      // handle domain error
  }
}
```

## Benefits of New Structure

1. **Testability**: Each use case is independently testable
2. **Maintainability**: Clear separation of concerns
3. **Extensibility**: Easy to add new use cases
4. **Type Safety**: Strong typing throughout
5. **DDD Compliance**: Follows domain-driven design principles
6. **Error Handling**: Rich, contextual error information

## Repository Pattern

The new structure includes a proper repository abstraction:

```typescript
export interface AccountRepository {
  save(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByName(name: string): Promise<Account | null>;
  findAll(options?: AccountFindOptions): Promise<Account[]>;
  delete(id: string): Promise<void>;
}
```

This allows for:
- Easy mocking in tests
- Swappable implementations
- Clear data access patterns
- Separation of persistence concerns

## Event Publishing

Domain events are now properly handled:

```typescript
await this.eventPublisher.publish({
  type: "AccountCreated",
  payload: {
    accountId: account.id,
    accountName: account.accountName,
  },
});
```

This enables:
- Loose coupling between bounded contexts
- Audit logging
- Integration with external systems
- Event sourcing capabilities
