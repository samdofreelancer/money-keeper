import { CategoryApplicationService } from "../services/category-application.service";
import { CustomWorld } from "../../../../support/world";
import { DeleteCurrentCategoryUseCase } from "./delete-current-category.use-case";
import { TryCreateDuplicateCategoryUseCase } from "./try-create-duplicate-category.use-case";
import { UpdateCategoryWithIconUseCase } from "./update-category-with-icon.use-case";
import { TryCreateInvalidLengthCategoryUseCase } from "./try-create-invalid-length-category.use-case";
import { SetupCategoryManagementUseCase } from "./setup-category-management.use-case";
import { SetupExistingCategoryUseCase } from "./setup-existing-category.use-case";
import { SetupMultipleCategoriesUseCase } from "./setup-multiple-categories.use-case";
import { SetupBothCategoryTypesUseCase } from "./setup-both-category-types.use-case";
import { SetupMultipleTestCategoriesUseCase } from "./setup-multiple-test-categories.use-case";
import { SetupMultipleIncomeExpenseCategoriesUseCase } from "./setup-multiple-income-expense-categories.use-case";
import { SetupBulkCategoriesUseCase } from "./setup-bulk-categories.use-case";
import { CreateCategoryWithIconUseCase } from "./create-category-with-icon.use-case";
import { PrepareCategoryCreationUseCase } from "./prepare-category-creation.use-case";
import { PrepareCategoryRenameUseCase } from "./prepare-category-rename.use-case";
import { CancelCategoryDeletionUseCase } from "./cancel-category-deletion.use-case";
import { CancelCurrentOperationUseCase } from "./cancel-current-operation.use-case";
import { StartCreatingCategoryUseCase } from "./start-creating-category.use-case";
import { StartEditingCategoryUseCase } from "./start-editing-category.use-case";
import { NavigateToApplicationUseCase } from "./navigate-to-application.use-case";
import { SearchCategoriesUseCase } from "./search-categories.use-case";
import { SearchSpecificCategoryUseCase } from "./search-specific-category.use-case";
import { SearchForSpecificCategoryUseCase } from "./search-for-specific-category.use-case";
import { ClearSearchFilterUseCase } from "./clear-search-filter.use-case";
import { FilterByCategoryTypeUseCase } from "./filter-by-category-type.use-case";
import { VerifyCategoryInResultsUseCase } from "./verify-category-in-results.use-case";
import { TryCreateInvalidCharactersCategoryUseCase } from "./try-create-invalid-characters-category.use-case";
import { TryCreateEmptyNameCategoryUseCase } from "./try-create-empty-name-category.use-case";
import { TryRenameCategoryUseCase } from "./try-rename-category.use-case";
import { VerifyCategoryExistsUseCase } from "./verify-category-exists.use-case";
import { VerifyCategoryNotExistsUseCase } from "./verify-category-not-exists.use-case";
import { VerifyCurrentCategoryInListUseCase } from "./verify-current-category-in-list.use-case";
import { VerifyCategoryNotInListUseCase } from "./verify-category-not-in-list.use-case";
import { VerifyErrorMessageUseCase } from "./verify-error-message.use-case";
import { VerifyCategoryNotCreatedUseCase } from "./verify-category-not-created.use-case";

/**
 * Factory for Category Use Cases
 * Provides easy access to all category-related use cases
 */
export class CategoryUseCasesFactory {
  constructor(
    private categoryService?: CategoryApplicationService,
    private world?: CustomWorld
  ) {}

  // Core workflow use cases
  createDeleteCurrentCategoryUseCase(): DeleteCurrentCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new DeleteCurrentCategoryUseCase(this.categoryService);
  }

  createUpdateCategoryWithIconUseCase(): UpdateCategoryWithIconUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new UpdateCategoryWithIconUseCase(this.categoryService);
  }

  createCreateCategoryWithIconUseCase(): CreateCategoryWithIconUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new CreateCategoryWithIconUseCase(this.categoryService);
  }

  createPrepareCategoryCreationUseCase(): PrepareCategoryCreationUseCase {
    if (!this.world) throw new Error("World required for this use case");
    return new PrepareCategoryCreationUseCase(this.world);
  }

  createPrepareCategoryRenameUseCase(): PrepareCategoryRenameUseCase {
    if (!this.world) throw new Error("World required for this use case");
    return new PrepareCategoryRenameUseCase(this.world);
  }

  createCancelCategoryDeletionUseCase(): CancelCategoryDeletionUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new CancelCategoryDeletionUseCase(this.categoryService);
  }

  createCancelCurrentOperationUseCase(): CancelCurrentOperationUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new CancelCurrentOperationUseCase(this.categoryService);
  }

  createStartCreatingCategoryUseCase(): StartCreatingCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new StartCreatingCategoryUseCase(this.categoryService);
  }

  createStartEditingCategoryUseCase(): StartEditingCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new StartEditingCategoryUseCase(this.categoryService);
  }

  // Setup use cases
  createSetupCategoryManagementUseCase(): SetupCategoryManagementUseCase {
    if (!this.world) throw new Error("World required for this use case");
    return new SetupCategoryManagementUseCase(this.world);
  }

  createSetupExistingCategoryUseCase(): SetupExistingCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SetupExistingCategoryUseCase(this.categoryService);
  }

  createSetupMultipleCategoriesUseCase(): SetupMultipleCategoriesUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SetupMultipleCategoriesUseCase(this.categoryService);
  }

  createSetupBothCategoryTypesUseCase(): SetupBothCategoryTypesUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SetupBothCategoryTypesUseCase(this.categoryService);
  }

  createSetupMultipleTestCategoriesUseCase(): SetupMultipleTestCategoriesUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SetupMultipleTestCategoriesUseCase(this.categoryService);
  }

  createSetupMultipleIncomeExpenseCategoriesUseCase(): SetupMultipleIncomeExpenseCategoriesUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SetupMultipleIncomeExpenseCategoriesUseCase(
      this.categoryService
    );
  }

  createSetupBulkCategoriesUseCase(): SetupBulkCategoriesUseCase {
    if (!this.categoryService || !this.world)
      throw new Error("CategoryService and World required for this use case");
    return new SetupBulkCategoriesUseCase(this.categoryService, this.world);
  }

  // Search use cases
  createSearchCategoriesUseCase(): SearchCategoriesUseCase {
    if (!this.categoryService || !this.world)
      throw new Error("CategoryService and World required for this use case");
    return new SearchCategoriesUseCase(this.categoryService, this.world);
  }

  createSearchSpecificCategoryUseCase(): SearchSpecificCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SearchSpecificCategoryUseCase(this.categoryService);
  }

  createSearchForSpecificCategoryUseCase(): SearchForSpecificCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new SearchForSpecificCategoryUseCase(this.categoryService);
  }

  createClearSearchFilterUseCase(): ClearSearchFilterUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new ClearSearchFilterUseCase(this.categoryService);
  }

  createFilterByCategoryTypeUseCase(): FilterByCategoryTypeUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new FilterByCategoryTypeUseCase(this.categoryService);
  }

  // Verification use cases
  createVerifyCategoryInResultsUseCase(): VerifyCategoryInResultsUseCase {
    if (!this.world) throw new Error("World required for this use case");
    return new VerifyCategoryInResultsUseCase(this.world);
  }

  createVerifyCategoryExistsUseCase(): VerifyCategoryExistsUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new VerifyCategoryExistsUseCase(this.categoryService);
  }

  createVerifyCategoryNotExistsUseCase(): VerifyCategoryNotExistsUseCase {
    if (!this.categoryService || !this.world)
      throw new Error("CategoryService and World required for this use case");
    return new VerifyCategoryNotExistsUseCase(this.categoryService, this.world);
  }

  createVerifyCurrentCategoryInListUseCase(): VerifyCurrentCategoryInListUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new VerifyCurrentCategoryInListUseCase(this.categoryService);
  }

  createVerifyCategoryNotInListUseCase(): VerifyCategoryNotInListUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new VerifyCategoryNotInListUseCase(this.categoryService);
  }

  createVerifyErrorMessageUseCase(): VerifyErrorMessageUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new VerifyErrorMessageUseCase(this.categoryService);
  }

  createVerifyCategoryNotCreatedUseCase(): VerifyCategoryNotCreatedUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new VerifyCategoryNotCreatedUseCase(this.categoryService);
  }

  // Validation testing use cases
  createTryCreateDuplicateCategoryUseCase(): TryCreateDuplicateCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new TryCreateDuplicateCategoryUseCase(this.categoryService);
  }

  createTryCreateInvalidLengthCategoryUseCase(): TryCreateInvalidLengthCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new TryCreateInvalidLengthCategoryUseCase(this.categoryService);
  }

  createTryCreateInvalidCharactersCategoryUseCase(): TryCreateInvalidCharactersCategoryUseCase {
    return new TryCreateInvalidCharactersCategoryUseCase();
  }

  createTryCreateEmptyNameCategoryUseCase(): TryCreateEmptyNameCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new TryCreateEmptyNameCategoryUseCase(this.categoryService);
  }

  createTryRenameCategoryUseCase(): TryRenameCategoryUseCase {
    if (!this.categoryService)
      throw new Error("CategoryService required for this use case");
    return new TryRenameCategoryUseCase(this.categoryService);
  }
}
