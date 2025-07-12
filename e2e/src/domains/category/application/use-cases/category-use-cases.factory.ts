import { CategoryApplicationService } from "../services/category-application.service";
import { DeleteCurrentCategoryUseCase } from "./delete-current-category.use-case";
import { TryCreateDuplicateCategoryUseCase } from "./try-create-duplicate-category.use-case";

/**
 * Factory for Category Use Cases
 * Provides easy access to all category-related use cases
 */
export class CategoryUseCasesFactory {
  constructor(private categoryService: CategoryApplicationService) {}

  createDeleteCurrentCategoryUseCase(): DeleteCurrentCategoryUseCase {
    return new DeleteCurrentCategoryUseCase(this.categoryService);
  }

  createTryCreateDuplicateCategoryUseCase(): TryCreateDuplicateCategoryUseCase {
    return new TryCreateDuplicateCategoryUseCase(this.categoryService);
  }
}
