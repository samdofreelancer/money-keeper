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

  private async handleApiCall<T>(
    operation: () => Promise<T>,
    message: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      logger.error(`${message}: ${error}`);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return this.handleApiCall(
      () => this.client.delete(`/categories/${categoryId}`),
      `Failed to delete category ${categoryId}`
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return this.handleApiCall(async () => {
      const dtos = await this.retry(
        async () => {
          const response = await this.client.get("/categories");
          return response.data;
        },
        3,
        500
      );
      return dtos.map(toDomain);
    }, "Failed to get all categories");
  }

  async createCategory(category: Category): Promise<Category> {
    logger.info(`Creating category: ${category.name}`);
    return this.handleApiCall(async () => {
      const dto = toDto(category);
      const response = await this.client.post("/categories", dto);
      return toDomain(response.data);
    }, "Failed to create category");
  }
}
