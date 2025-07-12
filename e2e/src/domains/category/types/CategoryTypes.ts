/**
 * Domain types for category operations
 */

// Value Object for Category Name
export interface CategoryName {
  readonly value: string;
}

// Value Object for Category Icon
export interface CategoryIcon {
  readonly value: string;
}

// Value Object for Category Type
export type CategoryType = "INCOME" | "EXPENSE";

// Value Object for Parent Category
export interface ParentCategory {
  readonly value?: string;
}

// Value Object for Category Criteria (search/filter)
export interface CategoryCriteria {
  readonly name?: CategoryName;
  readonly type?: CategoryType;
}

// Value Object for Validation Result
export interface CategoryValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

// Value Object for Creation Result
export interface CategoryCreationResult {
  readonly success: boolean;
  readonly categoryId?: string;
  readonly error?: string;
}
