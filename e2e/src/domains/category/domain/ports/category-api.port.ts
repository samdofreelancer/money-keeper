import { Category } from "../models/category";

export interface CategoryApiPort {
  getAllCategories(): Promise<Category[]>;
  createCategory(category: Category): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;
}
