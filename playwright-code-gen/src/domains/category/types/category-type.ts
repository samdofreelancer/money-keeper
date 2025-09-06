/**
 * Category type constants and validation utilities
 * Provides type-safe handling of category types with proper validation
 */

export enum CategoryType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export const CategoryTypeValues = ['EXPENSE', 'INCOME'] as const;

/**
 * Validates and parses a string into a CategoryType
 * @param input - The string to validate
 * @returns The validated CategoryType
 * @throws Error if the input is not a valid category type
 */
export function parseCategoryType(input: string): CategoryType {
  const normalizedInput = input.trim();

  if (CategoryTypeValues.includes(normalizedInput as CategoryType)) {
    return normalizedInput as CategoryType;
  }

  throw new Error(
    `Invalid category type: "${input}". Expected one of: ${CategoryTypeValues.join(', ')}`
  );
}

/**
 * Type guard to check if a value is a valid CategoryType
 * @param value - The value to check
 * @returns true if the value is a valid CategoryType
 */
export function isValidCategoryType(value: unknown): value is CategoryType {
  return (
    typeof value === 'string' &&
    CategoryTypeValues.includes(value as CategoryType)
  );
}
