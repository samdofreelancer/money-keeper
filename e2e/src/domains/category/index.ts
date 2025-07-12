/**
 * Category Domain Public API
 * Exports the main interfaces for the category domain
 */

// Application Services
export { CategoryApplicationService } from "./application/services/category-application.service";

// Domain Models
export {
  Category,
  CategoryType,
  CategoryEntity,
} from "./domain/models/category.model";

// Value Objects
export { CategoryFormValue } from "./domain/value-objects/category-form-data.vo";
export { CategorySearchValue } from "./domain/value-objects/category-search-criteria.vo";

// Infrastructure (for test setup)
export { CategoryApiClient } from "./infrastructure/api/category-api-client";
