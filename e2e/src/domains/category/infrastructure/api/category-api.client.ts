import {
  BaseApiClient,
  ApiClientConfig,
} from "../../../../shared/infrastructure/api/base-api-client";
import { logger } from "../../../../support/logger";
import { CategoryApiPort } from "../../domain/ports/category-api.port";
import { Category } from "../../domain/models/category";
import { toDomain, toDto } from "../dto/category-mapper";

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

  async getAllCategories(): Promise<Category[]> {
    try {
      const dtos = await this.retry(async () => {
        const response = await this.client.get("/categories");
        return response.data;
      }, 3, 500);
      return dtos.map(toDomain);
    } catch (error) {
      logger.error(`Failed to get all categories: ${error}`);
      throw error;
    }
  }

  async createCategory(category: Category): Promise<Category> {
    logger.info(`Creating category: ${category.name}`);
    try {
      const dto = toDto(category);
      const response = await this.client.post("/categories", dto);
      return toDomain(response.data);
    } catch (error) {
      logger.error(`Failed to create category: ${error}`);
      throw error;
    }
  }
}
