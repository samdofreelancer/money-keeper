import { APIRequestContext } from '@playwright/test';
import { CreateCategoryRequest, CategoryResponse } from '../types/category.dto';

export class CategoryApiClient {
  constructor(private request: APIRequestContext) {}

  private async assertOk(res: any, action: string): Promise<void> {
    if (!res.ok()) {
      let body = '';
      try {
        body = await res.text();
      } catch {}
      const preview = body.slice(0, 500);
      throw new Error(
        `[${action}] ${res.status()} ${res.url()} - ${res.statusText()}\n${preview}`
      );
    }
  }

  async createCategory(
    categoryData: CreateCategoryRequest
  ): Promise<CategoryResponse> {
    const response = await this.request.post('/api/categories', {
      data: categoryData,
    });

    await this.assertOk(response, 'createCategory');
    return response.json();
  }

  async getCategories(): Promise<CategoryResponse[]> {
    const response = await this.request.get('/api/categories');

    await this.assertOk(response, 'getCategories');
    return response.json();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const response = await this.request.delete(`/api/categories/${categoryId}`);

    await this.assertOk(response, 'deleteCategory');
  }

  async getCategoryByName(name: string): Promise<CategoryResponse | null> {
    const categories = await this.getCategories();
    return categories.find(category => category.name === name) || null;
  }
}
