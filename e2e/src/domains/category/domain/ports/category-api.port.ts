import { CategoryFormInput } from "../models/category-form-input";

export interface CategoryApiPort {
  getAllCategories(): Promise<CategoryFormInput[]>;
  createCategory(categoryInput: CategoryFormInput): Promise<CategoryFormInput>;
  deleteCategory(categoryId: string): Promise<void>;
}
