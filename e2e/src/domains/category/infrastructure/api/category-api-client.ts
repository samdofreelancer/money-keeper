import { BaseApiClient } from "../../../../shared/infrastructure/api/base-api-client";
import { Category, CategoryCreate } from "../../domain/models/category.model";

export class CategoryApiClient extends BaseApiClient {
  private readonly CATEGORIES_ENDPOINT = "/categories";

  async createCategory(category: CategoryCreate): Promise<Category> {
    return this.post<Category>(this.CATEGORIES_ENDPOINT, category);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.get<Category[]>(this.CATEGORIES_ENDPOINT);
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.get<Category>(`${this.CATEGORIES_ENDPOINT}/${id}`);
  }

  async updateCategory(
    id: string,
    category: Partial<CategoryCreate>
  ): Promise<Category> {
    return this.put<Category>(`${this.CATEGORIES_ENDPOINT}/${id}`, category);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete(`${this.CATEGORIES_ENDPOINT}/${id}`);
  }

  async deleteCategoryByName(name: string): Promise<void> {
    const categories = await this.getAllCategories();
    const category = categories.find((c) => c.name === name);
    if (category) {
      await this.deleteCategory(category.id);
    }
  }

  async getCategoriesByType(type: "INCOME" | "EXPENSE"): Promise<Category[]> {
    const categories = await this.getAllCategories();
    return categories.filter((c) => c.type === type);
  }
}
