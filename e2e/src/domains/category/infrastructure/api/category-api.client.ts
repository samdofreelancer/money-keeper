import {
  BaseApiClient,
  ApiClientConfig,
} from "../../../../shared/infrastructure/api/base-api-client";
import { logger } from "../../../../support/logger";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
  parentId?: string | null;
}

export class CategoryApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.client.delete(`/categories/${categoryId}`);
  }

  async getAllCategories(): Promise<Category[]> {
    const response = await this.client.get("/categories");
    return response.data;
  }

  async createCategory(data: {
    name: string;
    icon: string;
    type: string;
    parentId?: string | null;
  }): Promise<Category> {
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
