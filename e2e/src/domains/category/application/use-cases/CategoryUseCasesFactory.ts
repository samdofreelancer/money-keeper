import { CategoryUiPort } from "../../domain/ports/category-ui.port";
import { logger } from "../../../../shared";
import { CategoryApiClient } from "../../infrastructure/api/category-api.client";

export class CategoryUseCasesFactory {
  /**
   * Coordinates: ensure parent exists (API), track it, then create and track child (UI)
   */
  /**
   * Coordinates: ensure parent exists (API), track parent and child separately, then create and track child (UI)
   * When cleaning up, child should be deleted before parent.
   */
  async createCategoryWithParentWorkflow(
    name: string,
    icon: string,
    type: string,
    parent: string,
    trackCreatedCategory: (id: string, name: string, opts?: { isParent?: boolean }) => Promise<void>
  ): Promise<void> {
    const parentId = await this.ensureParentCategoryExists(parent);
    // Track parent with isParent flag
    await trackCreatedCategory(parentId, parent, { isParent: true });
    const categoryId = await this.createUniqueCategory(name, icon, type, parent);
    // Track child (normal)
    await trackCreatedCategory(categoryId, name, { isParent: false });
  }
  private categoryUiPort: CategoryUiPort;

  constructor(categoryUiPort: CategoryUiPort) {
    this.categoryUiPort = categoryUiPort;
  }

  /**
   * Ensures a parent category exists via backend API, returns its id
   */
  async ensureParentCategoryExists(parentName: string, apiBaseUrl?: string): Promise<string> {
    const categoryApiClient = new CategoryApiClient({ baseURL: apiBaseUrl || process.env.API_BASE_URL || "http://127.0.0.1:8080/api" });
    const categories = await categoryApiClient.getAllCategories();
    let parentCat = categories.find((cat: any) => cat.name === parentName);
    if (parentCat) {
      return parentCat.id;
    } else {
      const resp = await categoryApiClient.createCategory({ name: parentName, icon: 'default', type: 'expense' });
      return resp.id;
    }
  }

  async createCategory(name: string, icon: string, type: string, parent?: string): Promise<string> {
    await this.categoryUiPort.navigateToCategoryPage();
    return await this.categoryUiPort.createCategory(name, icon, type, parent);
  }

  async createUniqueCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    trackCreatedCategory?: (id: string, name: string) => Promise<void>
  ): Promise<string> {
    logger.info(`Creating unique category with icon: ${icon}, type: ${type}, parent: ${parent}`);
    await this.categoryUiPort.navigateToCategoryPage();
    const categoryId = await this.categoryUiPort.createUniqueCategory(name, icon, type, parent);
    if (trackCreatedCategory) {
      await trackCreatedCategory(categoryId, name);
    }
    return categoryId;
  }

  async isCategoryCreated(name: string): Promise<boolean> {
    return await this.categoryUiPort.isCategoryCreated(name);
  }

  async isCategoryChildOf(childName: string, parentName: string): Promise<boolean> {
    return await this.categoryUiPort.isCategoryChildOf(childName, parentName);
  }

  async createCategoryWithDuplicateName(name: string, icon: string, type: string): Promise<void> {
    await this.categoryUiPort.createCategoryWithDuplicateName(name, icon, type);
  }

  async updateCategoryParent(categoryName: string, newParentName: string): Promise<void> {
    await this.categoryUiPort.updateCategoryParent(categoryName, newParentName);
  }

  async deleteCategory(name: string): Promise<void> {
    await this.categoryUiPort.deleteCategory(name);
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    return await this.categoryUiPort.isErrorMessageVisible(message);
  }

  async listCategories(): Promise<string[]> {
    return await this.categoryUiPort.listCategories();
  }
}
