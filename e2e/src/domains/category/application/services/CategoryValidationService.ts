import { CategoryType } from "../../domain/models/category.model";

// Define validation types directly in this file since they don't exist elsewhere
interface CategoryName {
  value: string;
}

interface CategoryIcon {
  value: string;
}

interface ParentCategory {
  value: string;
}

interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Service for validating category data
 * Encapsulates business validation rules
 */
export class CategoryValidationService {
  /**
   * Validates category form data
   */
  validateCategoryData(categoryData: {
    name: CategoryName;
    icon: CategoryIcon;
    type: CategoryType;
    parentCategory?: ParentCategory;
  }): CategoryValidationResult {
    const errors: string[] = [];

    // Validate name
    if (!categoryData.name || categoryData.name.value.trim().length === 0) {
      errors.push("Category name is required");
    }

    if (categoryData.name && categoryData.name.value.trim().length > 100) {
      errors.push("Category name must be less than 100 characters");
    }

    // Validate special characters
    if (categoryData.name && /[<>!@#$%^&*()]/.test(categoryData.name.value)) {
      errors.push("Category name contains invalid special characters");
    }

    // Validate icon
    if (!categoryData.icon || categoryData.icon.value.trim().length === 0) {
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
