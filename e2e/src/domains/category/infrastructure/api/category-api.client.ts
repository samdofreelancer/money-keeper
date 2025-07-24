import {
  BaseApiClient,
  ApiClientConfig,
} from "../../../../shared/infrastructure/api/base-api-client";
import { logger } from "../../../../support/logger";
import { CategoryFormInput } from "../../domain/models/category-form-input";
import { CategoryApiPort } from "../../domain/ports/category-api.port";

export class CategoryApiClient
  extends BaseApiClient
  implements CategoryApiPort
{
  constructor(config: ApiClientConfig) {
    super(config);
  }

  private async retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise((res) => setTimeout(res, 500));
      }
    }
    throw new Error("Retries exhausted");
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await this.client.delete(`/categories/${categoryId}`);
    } catch (error) {
      logger.error(`Failed to delete category ${categoryId}: ${error}`);
      throw error;
    }
  }

  async getAllCategories(): Promise<CategoryFormInput[]> {
    try {
      return await this.retry(async () => {
        const response = await this.client.get("/categories");
        return response.data;
      });
    } catch (error) {
      logger.error(`Failed to get all categories: ${error}`);
      throw error;
    }
  }

  async createCategory(data: CategoryFormInput): Promise<CategoryFormInput> {
    logger.info(`Creating category: ${data.name}`);
    try {
      const response = await this.client.post("/categories", data);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create category: ${error}`);
      throw error;
    }
  }
}
