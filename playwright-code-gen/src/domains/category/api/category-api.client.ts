import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CreateCategoryRequest,
  CategoryResponse,
} from 'category-domain/types/category.dto';
import { Logger } from 'shared/utilities/logger';
import { Inject, Transient, TOKENS } from 'shared/di';

@Transient({ token: TOKENS.CategoryApiClient })
export class CategoryApiClient {
  private apiBaseUrl: string;

  constructor(
    @Inject(TOKENS.Request) private request: APIRequestContext,
    @Inject(TOKENS.ApiBaseUrl) baseUrl: string
  ) {
    this.apiBaseUrl = baseUrl;
    Logger.debug(
      `CategoryApiClient initialized with API base URL: ${this.apiBaseUrl}`
    );
  }

  private async assertOk(res: APIResponse, action: string): Promise<void> {
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

  private getApiUrl(endpoint: string): string {
    // If API_BASE_URL already includes '/api', don't duplicate it
    const baseUrl = this.apiBaseUrl.endsWith('/api')
      ? this.apiBaseUrl
      : `${this.apiBaseUrl}/api`;

    // Remove any trailing slashes from baseUrl and ensure endpoint starts with /
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  async createCategory(
    categoryData: CreateCategoryRequest
  ): Promise<CategoryResponse> {
    const apiUrl = this.getApiUrl('/categories');
    const response = await this.request.post(apiUrl, {
      data: categoryData,
    });

    await this.assertOk(response, 'createCategory');
    return response.json();
  }

  async getCategories(): Promise<CategoryResponse[]> {
    const apiUrl = this.getApiUrl('/categories');
    const response = await this.request.get(apiUrl);

    await this.assertOk(response, 'getCategories');
    return response.json();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const apiUrl = this.getApiUrl(`/categories/${categoryId}`);
    const response = await this.request.delete(apiUrl);

    await this.assertOk(response, 'deleteCategory');
  }

  async getCategoryByName(name: string): Promise<CategoryResponse | null> {
    const categories = await this.getCategories();
    return categories.find(category => category.name === name) || null;
  }

  async findByName(name: string): Promise<CategoryResponse[]> {
    const categories = await this.getCategories();
    return categories.filter(category => category.name === name);
  }
}
