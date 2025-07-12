/**
 * Value object for category form data
 */

import { CategoryType } from "./Category";

export interface CategoryFormData {
  name: string;
  icon: string;
  type: CategoryType;
  parentCategory?: string;
}

export class CategoryFormValue {
  readonly name: string;
  readonly icon: string;
  readonly type: CategoryType;
  readonly parentCategory?: string;

  constructor(data: CategoryFormData) {
    this.name = data.name;
    this.icon = data.icon;
    this.type = data.type;
    this.parentCategory = data.parentCategory;
  }

  /**
   * Validates form data
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === "") {
      errors.push("Please input category name");
    }

    if (this.name && this.name.length > 100) {
      errors.push("Category name cannot exceed 100 characters");
    }

    if (this.name && this.containsInvalidCharacters(this.name)) {
      errors.push("Category name contains invalid special characters");
    }

    if (!this.icon || this.icon.trim() === "") {
      errors.push("Category icon is required");
    }

    if (!this.type) {
      errors.push("Category type is required");
    }

    return errors;
  }

  private containsInvalidCharacters(name: string): boolean {
    // Define invalid characters for category names
    const invalidChars = "<>!@#$%^&*()[]{}|\\;:'\",/?";
    return invalidChars.split("").some((char) => name.includes(char));
  }
}
