/**
 * Domain model for Category entity
 * Represents a category in the personal finance domain
 */

export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryEntity implements Category {
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<Category, "createdAt" | "updatedAt">) {
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.type = data.type;
    this.parentId = data.parentId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Updates category with new data
   */
  update(
    data: Partial<Pick<Category, "name" | "icon" | "type" | "parentId">>
  ): void {
    if (data.name) this.name = data.name;
    if (data.icon) this.icon = data.icon;
    if (data.type) this.type = data.type;
    if (data.parentId !== undefined) this.parentId = data.parentId;
    this.updatedAt = new Date();
  }

  /**
   * Validates category name
   */
  validateName(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === "") {
      errors.push("Category name is required");
    }

    if (this.name && this.name.length > 100) {
      errors.push("Category name cannot exceed 100 characters");
    }

    if (this.name && this.containsInvalidCharacters(this.name)) {
      errors.push("Category name contains invalid special characters");
    }

    return errors;
  }

  /**
   * Checks if category is income type
   */
  isIncome(): boolean {
    return this.type === "INCOME";
  }

  /**
   * Checks if category is expense type
   */
  isExpense(): boolean {
    return this.type === "EXPENSE";
  }

  /**
   * Checks if category has parent
   */
  hasParent(): boolean {
    return !!this.parentId;
  }

  private containsInvalidCharacters(name: string): boolean {
    // Define invalid characters for category names
    const invalidChars = "<>!@#$%^&*()[]{}|\\;:'\",/?";
    return invalidChars.split("").some((char) => name.includes(char));
  }
}
