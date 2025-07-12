import {
  CategoryFormData,
  CategoryValidationResult,
} from "../types/CategoryTypes";

/**
 * Service for validating category data
 * Encapsulates business validation rules
 */
export class CategoryValidationService {
  /**
   * Validates category form data
   */
  validateCategoryData(
    categoryData: CategoryFormData
  ): CategoryValidationResult {
    const errors: string[] = [];

    // Validate name
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.push("Category name is required");
    }

    if (categoryData.name && categoryData.name.trim().length > 100) {
      errors.push("Category name must be less than 100 characters");
    }

    // Validate special characters
    if (categoryData.name && /[<>!@#$%^&*()]/.test(categoryData.name)) {
      errors.push("Category name contains invalid special characters");
    }

    // Validate icon
    if (!categoryData.icon || categoryData.icon.trim().length === 0) {
      errors.push("Category icon is required");
    }

    // Validate type
    if (
      !categoryData.type ||
      !["INCOME", "EXPENSE"].includes(categoryData.type)
    ) {
      errors.push("Category type must be either INCOME or EXPENSE");
    }

    const result: CategoryValidationResult = {
      isValid: errors.length === 0,
      errors: errors,
    };

    if (!result.isValid) {
      throw new Error(`Category validation failed: ${errors.join(", ")}`);
    }

    return result;
  }

  /**
   * Validates category name for uniqueness (would typically check against existing categories)
   */
  validateCategoryNameUniqueness(
    categoryName: string,
    existingCategories: string[]
  ): boolean {
    return !existingCategories.includes(categoryName);
  }
}
