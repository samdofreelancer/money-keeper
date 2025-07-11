/**
 * Domain types for category operations
 */

export interface CategoryFormData {
  name: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
  parentCategory?: string;
}

export interface CategorySearchCriteria {
  searchTerm?: string;
  categoryType?: "INCOME" | "EXPENSE";
}

export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CategoryCreationResult {
  success: boolean;
  categoryId?: string;
  error?: string;
}
