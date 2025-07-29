import { CategoryUiPort } from "../../domain/ports/category-ui.port";
import { logger } from "../../../../shared";
import { CategoryApiClient } from "../../infrastructure/api/category-api.client";
import { CategoryApiPort } from "../../domain/ports/category-api.port";
import { Category } from "../../domain/models/category";

export class CategoryUseCasesFactory {
  private categoryUiPort: CategoryUiPort;

  private categoryApiPort: CategoryApiPort;

  public lastCreatedCategoryName?: string;

  constructor(categoryUiPort: CategoryUiPort) {
    this.categoryUiPort = categoryUiPort;
    this.categoryApiPort = new CategoryApiClient({
      baseURL: process.env.API_BASE_URL || "http://127.0.0.1:8080/api",
    });
  }

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
    trackCreatedCategory: (
      id: string,
      name: string,
      opts?: { isParent?: boolean }
    ) => Promise<void>
  ): Promise<void> {
    // Create and track child
    await this.createUniqueCategory(
      name,
      icon,
      type,
      parent,
      trackCreatedCategory
    );
  }

  /**
   * Ensures a parent category exists via backend API, returns its id
   */
  async ensureParentCategoryExists(
    parentName: string,
    icon: string,
    type: string,
    apiBaseUrl?: string,
    trackCreatedCategory?: (
      id: string,
      name: string,
      opts?: { isParent?: boolean }
    ) => Promise<void>
  ): Promise<string> {
    const categories = await this.categoryApiPort.getAllCategories();
    const parentCat = categories.find(
      (cat: Category) => cat.name === parentName
    );
    // Normalize type to match backend enum (EXPENSE/INCOME)
    const normalizedType = (type || "EXPENSE").toUpperCase();
    const normalizedIcon = icon || "default";
    if (parentCat) {
      if (trackCreatedCategory) {
        await trackCreatedCategory(parentCat.id, parentName, {
          isParent: true,
        });
      }
      // Always reload the UI after backend change
      await this.categoryUiPort.reloadCategoryPage();
      return parentCat.id;
    } else {
      const resp = await this.categoryApiPort.createCategory({
        id: "",
        name: parentName,
        icon: normalizedIcon,
        type: normalizedType,
      });
      if (trackCreatedCategory) {
        await trackCreatedCategory(resp.id, parentName, { isParent: true });
      }

      // Fetch all categories to verify creation
      const allCategories = await this.categoryApiPort.getAllCategories();
      logger.info(`allCategories: ${JSON.stringify(allCategories)}`);
      const createdCat = allCategories.find(
        (cat: Category) => cat.name === parentName
      );
      if (!createdCat) {
        throw new Error(
          `Category '${parentName}' was not found after creation via API.`
        );
      }
      // Always reload the UI after backend change
      await this.categoryUiPort.reloadCategoryPage();
      return resp.id;
    }
  }

  async createCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    expectError = false,
    trackCreatedCategory?: (id: string, name: string) => void
  ): Promise<string | void> {
    await this.categoryUiPort.navigateToCategoryPage();
    const result = await this.categoryUiPort.createCategory(
      name,
      icon,
      type,
      parent,
      expectError
    );
    // If a category was created and a tracker is provided, call it
    if (!expectError && result && trackCreatedCategory) {
      trackCreatedCategory(result, name);
    }
    if (!expectError) {
      this.lastCreatedCategoryName = name;
    }
    return result;
  }

  async createUniqueCategory(
    name: string,
    icon: string,
    type: string,
    parent?: string,
    trackCreatedCategory?: (id: string, name: string) => Promise<void>,
    expectError = false
  ): Promise<string | void> {
    logger.info(
      `Creating unique category with icon: ${icon}, type: ${type}, parent: ${parent}, expectError: ${expectError}`
    );
    const categoryId = await this.categoryUiPort.createUniqueCategory(
      name,
      icon,
      type,
      parent,
      expectError
    );

    logger.info(
      `Category created: ${categoryId} and trackCreatedCategory: ${trackCreatedCategory}`
    );
    if (trackCreatedCategory && categoryId) {
      logger.info(`call trackCreatedCategory`);
      await trackCreatedCategory(categoryId.toString(), name);
    } else {
      logger.info(`Don't call trackCreatedCategory`);
    }
    return categoryId;
  }

  async isCategoryCreated(name: string): Promise<boolean> {
    return await this.categoryUiPort.isCategoryCreated(name);
  }

  async isCategoryChildOf(
    childName: string,
    parentName: string
  ): Promise<boolean> {
    return await this.categoryUiPort.isCategoryChildOf(childName, parentName);
  }

  async createCategoryWithDuplicateName(
    name: string,
    icon: string,
    type: string
  ): Promise<void> {
    await this.categoryUiPort.createCategory(name, icon, type, undefined, true);
  }

  async updateCategoryParent(
    categoryName: string,
    newParentName: string
  ): Promise<void> {
    await this.categoryUiPort.updateCategoryParent(categoryName, newParentName);
  }

  async updateCategoryNameAndIcon(
    oldName: string,
    newName: string,
    newIcon: string
  ): Promise<void> {
    await this.categoryUiPort.updateCategoryNameAndIcon(
      oldName,
      newName,
      newIcon
    );
  }

  async deleteCategory(name: string): Promise<void> {
    await this.categoryUiPort.deleteCategory(name);
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    return await this.categoryUiPort.isErrorMessageVisible(message);
  }

  async isErrorMessageVisibleInErrorBox(message: string): Promise<boolean> {
    return await this.categoryUiPort.isErrorMessageVisibleInErrorBox(message);
  }

  async waitForToastMessage(
    message: string,
    timeout?: number
  ): Promise<boolean> {
    return await this.categoryUiPort.waitForToastMessage(message, timeout);
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

  async createChildCategory(
    name: string,
    icon: string,
    type: string,
    parent: string,
    trackCreatedCategory?: (
      id: string,
      name: string,
      opts?: { isParent?: boolean }
    ) => Promise<void>
  ): Promise<void> {
    // Ensure parent exists and get its ID
    const parentId = await this.ensureParentCategoryExists(
      parent,
      icon, // Optionally, you may want to use a default or specific icon/type for the parent
      type,
      undefined,
      trackCreatedCategory
    );

    // Normalize type to match backend enum (EXPENSE/INCOME)
    const normalizedType = (type || "EXPENSE").toUpperCase();
    const normalizedIcon = icon || "default";
    // Create the child category via backend API
    const categoryInput: Category = {
      id: "",
      name: name,
      icon: normalizedIcon,
      type: normalizedType,
      parentId,
    };
    const resp = await this.categoryApiPort.createCategory(categoryInput);

    if (trackCreatedCategory) {
      await trackCreatedCategory(resp.id, name, { isParent: false });
    }
    // Reload the page to ensure the UI reflects the new backend data
    await this.categoryUiPort.reloadCategoryPage();
    // Assert the new category is visible on the UI
    const isVisible = await this.isCategoryCreated(name);
    if (!isVisible) {
      throw new Error(
        `Category '${name}' was not found on the UI after backend creation and reload.`
      );
    }
  }

  async createCategoryExpectingError(
    name: string,
    icon: string,
    type: string
  ): Promise<void> {
    await this.createUniqueCategory(
      name,
      icon,
      type,
      undefined,
      undefined,
      true // expectError
    );
  }

  public async attemptToCreateCategoryWithNameExceedingMaxLength(
    icon: string,
    type: string,
    onCreated?: (name: string) => void
  ) {
    const maxLength = 255; // Ideally, get from config/constant
    const longName = this.generateUniqueName(maxLength + 1);
    if (onCreated) onCreated(longName);
    await this.createCategory(
      longName,
      icon,
      type,
      undefined,
      true, // expectError: true (validation error expected)
      onCreated
    );
  }

  public async createCategoryWithGeneratedName(
    length: number,
    icon: string,
    type: string,
    onCreated?: (name: string) => void
  ): Promise<string> {
    const name = this.generateUniqueName(length);
    if (onCreated) onCreated(name);
    await this.createCategory(
      name,
      icon,
      type,
      undefined,
      false, // expectError: false (happy case)
      onCreated
    );
    return name;
  }

  public async attemptToCreateCategoryWithDuplicateName(
    icon: string,
    type: string,
    onCreated?: (name: string) => void
  ) {
    // Assume the last created category name is the duplicate
    const duplicateName = this.lastCreatedCategoryName || "DuplicateCategory";
    if (onCreated) onCreated(duplicateName);
    await this.createCategory(
      duplicateName,
      icon,
      type,
      undefined,
      true, // expectError: true (validation error expected)
      onCreated
    );
  }

  // Helper to generate a unique name of a given length
  public generateUniqueName(length: number): string {
    // Generate a fully random string of the requested length
    function randomString(len: number) {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    return randomString(length);
  }
}
