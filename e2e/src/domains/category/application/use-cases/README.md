# CategoryUseCasesFactory - Improvements & Usage

## Overview

The `CategoryUseCasesFactory` has been significantly refactored to improve maintainability, testability, and error handling. This document outlines the key improvements and usage patterns.

## Key Improvements

### 1. **Dependency Injection**
- ✅ Proper dependency injection for both UI and API ports
- ✅ Optional parameters with sensible defaults
- ✅ Easy to mock for testing

```typescript
// Before: Hard-coded dependencies
constructor(categoryUiPort: CategoryUiPort) {
  this.categoryApiPort = new CategoryApiClient(/* hard-coded config */);
}

// After: Flexible dependency injection
constructor(
  categoryUiPort: CategoryUiPort,
  categoryApiPort?: CategoryApiPort,
  apiConfig?: ApiConfig
) {
  // Proper injection with fallbacks
}
```

### 2. **Custom Error Types**
- ✅ Specific error types for different failure scenarios
- ✅ Better error context and debugging information
- ✅ Consistent error handling patterns

```typescript
// Available error types
CategoryCreationError      // For creation failures
CategoryNotFoundError     // For missing categories
CategoryValidationError   // For input validation failures
```

### 3. **Improved Type Safety**
- ✅ Standardized method signatures using options objects
- ✅ Proper TypeScript interfaces for all parameters
- ✅ Better return type definitions

```typescript
// Before: Inconsistent parameters
createCategory(name, icon, type, parent?, expectError?, trackCreatedCategory?)

// After: Options object pattern
createCategory(name: string, icon: string, type: string, options: CreateCategoryOptions = {})
```

### 4. **Configuration Management**
- ✅ Externalized constants to separate config file
- ✅ Type-safe configuration options
- ✅ Easy to modify without changing core logic

### 5. **Enhanced Logging**
- ✅ Structured logging with context
- ✅ Appropriate log levels (debug, info, error)
- ✅ Consistent logging patterns throughout

### 6. **Input Validation**
- ✅ Comprehensive validation for all inputs
- ✅ Early validation with clear error messages
- ✅ Centralized validation logic

## Usage Examples

### Basic Category Creation

```typescript
const factory = new CategoryUseCasesFactory(uiPort, apiPort);

// Simple creation
await factory.createCategory('Food', 'food-icon', 'EXPENSE');

// With options
await factory.createCategory('Transportation', 'car-icon', 'EXPENSE', {
  parent: 'Travel',
  trackCreatedCategory: async (id, name) => {
    console.log(`Created category ${name} with ID ${id}`);
  }
});
```

### Error Handling

```typescript
try {
  await factory.createCategory('', 'icon', 'EXPENSE');
} catch (error) {
  if (error instanceof CategoryValidationError) {
    console.log('Validation failed:', error.message);
  } else if (error instanceof CategoryCreationError) {
    console.log('Creation failed:', error.message);
  }
}
```

### Parent-Child Workflows

```typescript
// Ensure parent exists and create child
await factory.createCategoryWithParentWorkflow(
  'Groceries',     // child name
  'grocery-icon',  // icon
  'EXPENSE',       // type
  'Food',          // parent name
  async (id, name, opts) => {
    console.log(`Tracked: ${name} (${id}) - Parent: ${opts?.isParent}`);
  }
);
```

### Testing with Dependency Injection

```typescript
// Easy mocking for tests
const mockUiPort = createMockUiPort();
const mockApiPort = createMockApiPort();
const factory = new CategoryUseCasesFactory(mockUiPort, mockApiPort);

// Test creation flow
mockApiPort.getAllCategories.mockResolvedValue([]);
mockUiPort.createCategory.mockResolvedValue('test-id');

const result = await factory.createCategory('Test', 'icon', 'EXPENSE');
expect(result).toBe('test-id');
```

## Best Practices

### 1. **Always Use Try-Catch**
```typescript
try {
  await factory.createCategory(name, icon, type);
} catch (error) {
  // Handle specific error types
  if (error instanceof CategoryValidationError) {
    // Show validation message to user
  } else {
    // Log unexpected errors
    logger.error('Unexpected error', { error });
  }
}
```

### 2. **Use Tracking Callbacks for Cleanup**
```typescript
const createdCategories: string[] = [];

const trackCreatedCategory = async (id: string, name: string) => {
  createdCategories.push(id);
};

// Use in tests for cleanup
afterEach(async () => {
  for (const id of createdCategories) {
    await factory.deleteCategory(id);
  }
  createdCategories.length = 0;
});
```

### 3. **Leverage Configuration**
```typescript
import { CATEGORY_CONFIG } from '../config/category.config';

// Use constants instead of magic numbers
const maxLength = CATEGORY_CONFIG.MAX_NAME_LENGTH;
const defaultIcon = CATEGORY_CONFIG.DEFAULT_ICON;
```

## Migration Guide

### From Old to New API

#### Method Signature Changes
```typescript
// OLD
await factory.createCategory(name, icon, type, parent, expectError, trackCallback);

// NEW
await factory.createCategory(name, icon, type, {
  parent,
  expectError,
  trackCreatedCategory: trackCallback
});
```

#### Error Handling Updates
```typescript
// OLD
try {
  await factory.createCategory(name, icon, type);
} catch (error) {
  console.log('Generic error:', error.message);
}

// NEW
try {
  await factory.createCategory(name, icon, type);
} catch (error) {
  if (error instanceof CategoryValidationError) {
    // Handle validation errors
  } else if (error instanceof CategoryCreationError) {
    // Handle creation errors
  }
}
```

#### Constructor Updates
```typescript
// OLD
const factory = new CategoryUseCasesFactory(uiPort);

// NEW (backward compatible)
const factory = new CategoryUseCasesFactory(uiPort);

// NEW (with dependency injection)
const factory = new CategoryUseCasesFactory(uiPort, apiPort, { baseURL: 'custom-url' });
```

## Testing

The improved factory is designed for comprehensive testing:

- **Unit Tests**: Use dependency injection to mock all external dependencies
- **Integration Tests**: Test with real implementations but controlled data
- **Error Scenarios**: Use custom error types to test specific failure cases

See `__tests__/CategoryUseCasesFactory.test.ts` for comprehensive test examples.

## Future Improvements

Potential areas for further enhancement:

1. **Caching**: Add intelligent caching for `getAllCategories` calls
2. **Batch Operations**: Support for creating multiple categories at once
3. **Validation Rules**: More sophisticated validation (e.g., business rules)
4. **Performance Metrics**: Add timing and performance monitoring
5. **Retry Logic**: Implement automatic retry for transient failures