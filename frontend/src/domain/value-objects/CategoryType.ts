/**
 * Enumeration representing category types
 * Follows backend domain model (INCOME, EXPENSE, TRANSFER)
 */
export enum CategoryTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

/**
 * Value object representing a category type with validation
 */
export class CategoryType {
  private readonly type: CategoryTypeEnum;

  private constructor(type: CategoryTypeEnum) {
    this.type = type;
  }

  /**
   * Factory method to create CategoryType from string
   * @param typeStr Type string (case-insensitive)
   * @returns CategoryType instance
   */
  static of(typeStr: string): CategoryType {
    const normalized = typeStr.toUpperCase();
    if (!Object.values(CategoryTypeEnum).includes(normalized as CategoryTypeEnum)) {
      throw new Error(`Invalid category type: ${typeStr}. Must be one of: ${Object.values(CategoryTypeEnum).join(', ')}`);
    }
    return new CategoryType(normalized as CategoryTypeEnum);
  }

  /**
   * Create from enum value
   */
  static fromEnum(type: CategoryTypeEnum): CategoryType {
    return new CategoryType(type);
  }

  /**
   * Get the type value
   */
  getValue(): CategoryTypeEnum {
    return this.type;
  }

  /**
   * Get display name
   */
  getDisplayName(): string {
    const names: Record<CategoryTypeEnum, string> = {
      [CategoryTypeEnum.INCOME]: 'Income',
      [CategoryTypeEnum.EXPENSE]: 'Expense',
      [CategoryTypeEnum.TRANSFER]: 'Transfer',
    };
    return names[this.type];
  }

  /**
   * Check equality
   */
  equals(other: CategoryType): boolean {
    return this.type === other.type;
  }

  /**
   * Check if income type
   */
  isIncome(): boolean {
    return this.type === CategoryTypeEnum.INCOME;
  }

  /**
   * Check if expense type
   */
  isExpense(): boolean {
    return this.type === CategoryTypeEnum.EXPENSE;
  }

  /**
   * Check if transfer type
   */
  isTransfer(): boolean {
    return this.type === CategoryTypeEnum.TRANSFER;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.type;
  }
}
