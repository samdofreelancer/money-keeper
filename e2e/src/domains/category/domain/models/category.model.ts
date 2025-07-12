/**
 * Category Domain Model
 * Pure domain entity representing a category in the money-keeper system
 */

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly type: CategoryType;
  readonly parentId: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export type CategoryType = "INCOME" | "EXPENSE";

export type CategoryCreate = Omit<Category, "id" | "createdAt" | "updatedAt">;

export type CategoryUpdate = Partial<CategoryCreate>;

/**
 * Domain entity for Category with business rules
 */
export class CategoryEntity {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly icon: string,
    private readonly type: CategoryType,
    private readonly parentId: string | null = null
  ) {
    this.validateName(name);
    this.validateIcon(icon);
    this.validateType(type);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getIcon(): string {
    return this.icon;
  }

  getType(): CategoryType {
    return this.type;
  }

  getParentId(): string | null {
    return this.parentId;
  }

  isIncomeCategory(): boolean {
    return this.type === "INCOME";
  }

  isExpenseCategory(): boolean {
    return this.type === "EXPENSE";
  }

  hasParent(): boolean {
    return this.parentId !== null;
  }

  toPlainObject(): Category {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      type: this.type,
      parentId: this.parentId,
    };
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }
    if (name.length > 50) {
      throw new Error("Category name cannot exceed 50 characters");
    }
  }

  private validateIcon(icon: string): void {
    if (!icon || icon.trim().length === 0) {
      throw new Error("Category icon cannot be empty");
    }
  }

  private validateType(type: CategoryType): void {
    if (!["INCOME", "EXPENSE"].includes(type)) {
      throw new Error("Category type must be either INCOME or EXPENSE");
    }
  }
}
