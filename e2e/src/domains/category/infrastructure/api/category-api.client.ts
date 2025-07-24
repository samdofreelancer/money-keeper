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
      const response = await this.client.get("/categories");
      return response.data;
    } catch (error) {
      logger.error(`Failed to get all categories: ${error}`);
      throw error;
    }
  }

  async createCategory(data: CategoryFormInput): Promise<CategoryFormInput> {
    logger.info(`Creating category with data: ${JSON.stringify(data)}`);
    try {
      const response = await this.client.post("/categories", data);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create category: ${error}`);
      throw error;
    }
  }
}
