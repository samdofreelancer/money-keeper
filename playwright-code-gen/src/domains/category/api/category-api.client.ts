import { APIRequestContext } from '@playwright/test';
import { CategoryDto, CreateCategoryRequest, CategoryResponse } from '../types/category.dto';

export class CategoryApiClient {
  constructor(private request: APIRequestContext) {}

  async createCategory(categoryData: CreateCategoryRequest): Promise<CategoryResponse> {
    const response = await this.request.post('/api/categories', {
      data: categoryData,
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getCategories(): Promise<CategoryResponse[]> {
    const response = await this.request.get('/api/categories');
    
    if (!response.ok()) {
      throw new Error(`Failed to get categories: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const response = await this.request.delete(`/api/categories/${categoryId}`);
    
    if (!response.ok()) {
      throw new Error(`Failed to delete category: ${response.statusText}`);
    }
  }

  async getCategoryByName(name: string): Promise<CategoryResponse | null> {
    const categories = await this.getCategories();
    return categories.find(category => category.name === name) || null;
  }
}
