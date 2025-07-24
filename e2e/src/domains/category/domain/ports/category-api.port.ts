import { Category } from "../models/category-vo";

export interface CategoryApiPort {
  getAllCategories(): Promise<Category[]>;
  createCategory(data: {
    name: string;
    icon: string;
    type: string;
    parentId?: string | null;
  }): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;
}
