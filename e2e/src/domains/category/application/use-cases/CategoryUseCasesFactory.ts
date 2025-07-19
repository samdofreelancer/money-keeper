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
    // Create and track child
    const categoryId = await this.createUniqueCategory(
      name,
      icon,
      type,
      parent,
      trackCreatedCategory
    );
  }
  private categoryUiPort: CategoryUiPort;

  constructor(categoryUiPort: CategoryUiPort) {
    this.categoryUiPort = categoryUiPort;
  }

  /**
   * Ensures a parent category exists via backend API, returns its id
   */
  async ensureParentCategoryExists(
    parentName: string,
    icon: string,
    type: string,
    apiBaseUrl?: string,
    trackCreatedCategory?: (id: string, name: string, opts?: { isParent?: boolean }) => Promise<void>
  ): Promise<string> {
    const categoryApiClient = new CategoryApiClient({ baseURL: apiBaseUrl || process.env.API_BASE_URL || "http://127.0.0.1:8080/api" });
    const categories = await categoryApiClient.getAllCategories();
    let parentCat = categories.find((cat: any) => cat.name === parentName);
    // Normalize type to match backend enum (EXPENSE/INCOME)
    const normalizedType = (type || 'EXPENSE').toUpperCase();
    const normalizedIcon = icon || 'default';
    if (parentCat) {
      if (trackCreatedCategory) {
        await trackCreatedCategory(parentCat.id, parentName, { isParent: true });
      }
      return parentCat.id;
    } else {
      const resp = await categoryApiClient.createCategory({ name: parentName, icon: normalizedIcon, type: normalizedType });
      if (trackCreatedCategory) {
        await trackCreatedCategory(resp.id, parentName, { isParent: true });
      }

      // Fetch all categories to verify creation
      const allCategories = await categoryApiClient.getAllCategories();
      logger.info(`allCategories: ${JSON.stringify(allCategories)}`)
      const createdCat = allCategories.find((cat: any) => cat.name === parentName);
      if (!createdCat) {
        throw new Error(`Category '${parentName}' was not found after creation via API.`);
      }
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

  async updateCategoryNameAndIcon(oldName: string, newName: string, newIcon: string): Promise<void> {
    await this.categoryUiPort.updateCategoryNameAndIcon(oldName, newName, newIcon);
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

  async navigateToCategoryPage(): Promise<void> {
    await this.categoryUiPort.navigateToCategoryPage();
  }

  async assertOnCategoryPage(): Promise<void> {
    await this.categoryUiPort.assertOnCategoryPage();
  }
}
