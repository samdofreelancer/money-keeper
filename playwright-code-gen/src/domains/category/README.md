# Category Domain

This directory contains the migrated category management functionality from the original `playwright/e2e/category-management.spec.ts` file.

## Structure

- **api/** - API client for category operations
- **pages/** - Page object model for category UI interactions
- **steps/** - Cucumber step definitions for BDD tests
- **types/** - TypeScript interfaces and DTOs
- **usecases/** - Business logic for category operations
- **__tests__/** - Test files for verification

## Files Migrated

1. **category-management.spec.ts** → Split into:
   - `types/category.dto.ts` - Data transfer objects
   - `api/category-api.client.ts` - API client
   - `pages/categories.playwright.page.ts` - Page object
   - `usecases/category.use-case.ts` - Business logic
   - `steps/category.steps.ts` - Step definitions
   - `features/categories/category-creation.feature` - BDD feature

2. **Utility Functions**:
   - `generateTestName()` → `shared/utilities/category-test-helpers.ts`
   - `findCategoryRowByName()` → `pages/categories.playwright.page.ts`
   - `verifyCategoryNameExists()` → `usecases/category.use-case.ts`

## Usage

### Running BDD Tests
```bash
npm run test:cucumber -- --tags "@category"
```

### Running Unit Tests
```bash
npm run test:playwright -- category-migration.test.ts
```

## Test Coverage

The migration covers:
- ✅ Creating categories without parent
- ✅ Category cleanup (delete if exists)
- ✅ Category verification
- ✅ Error handling
- ✅ Test data generation
- ✅ UI interactions
- ✅ API interactions
