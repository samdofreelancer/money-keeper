import { CategoryType } from "../models/category.model";

/**
 * Value Object for Category Form Data
 * Encapsulates form validation and data transformation logic
 */

export interface CategoryFormData {
  name: string;
  icon: string;
  type: CategoryType;
  parentCategory?: string;
}

export class CategoryFormValue {
  constructor(private readonly data: CategoryFormData) {
    this.validate();
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string {
    return this.data.icon;
  }

  get type(): CategoryType {
    return this.data.type;
  }

  get parentCategory(): string | undefined {
    return this.data.parentCategory;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.data.name || this.data.name.trim().length === 0) {
      errors.push("Category name is required");
    }

    if (this.data.name && this.data.name.length > 50) {
      errors.push("Category name cannot exceed 50 characters");
    }

    if (!this.data.icon || this.data.icon.trim().length === 0) {
      errors.push("Category icon is required");
    }

    if (!["INCOME", "EXPENSE"].includes(this.data.type)) {
      errors.push("Category type must be either INCOME or EXPENSE");
    }

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }

  toCreateRequest(): {
    name: string;
    icon: string;
    type: CategoryType;
    parentId: string | null;
  } {
    return {
      name: this.data.name,
      icon: this.data.icon,
      type: this.data.type,
      parentId: this.data.parentCategory || null,
    };
  }
}
