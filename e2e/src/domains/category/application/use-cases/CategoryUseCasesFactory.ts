import { Page } from "@playwright/test";

import { CategoryUiPort } from "../../domain/ports/category-ui.port";
import { logger } from "../../../../shared";
import { CategoryApiClient } from "../../infrastructure/api/category-api.client";
import { CategoryApiPort } from "../../domain/ports/category-api.port";
import { Category } from "../../domain/models/category";
import { CATEGORY_CONFIG } from "../config/category.config";

// Custom Error Types
export class CategoryCreationError extends Error {
  public readonly cause?: Error;

  constructor(categoryName: string, cause?: Error) {
    super(`Failed to create category '${categoryName}'`);
    this.name = "CategoryCreationError";
    this.cause = cause;
  }
}

export class CategoryNotFoundError extends Error {
  constructor(categoryName: string) {
    super(`Category '${categoryName}' was not found`);
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryValidationError";
  }
}

// Interfaces for better type safety
export interface CreateCategoryOptions {
  parent?: string;
  expectError?: boolean;
  trackCreatedCategory?: (
    id: string,
    name: string,
    opts?: { isParent?: boolean }
  ) => Promise<void>;
}

export interface ApiConfig {
  baseURL: string;
}

export interface TrackingCallback {
  (id: string, name: string, opts?: { isParent?: boolean }): Promise<void>;
}

export class CategoryUseCasesFactory {
  private categoryUiPort: CategoryUiPort;
  private categoryApiPort: CategoryApiPort;
  public lastCreatedCategoryName?: string;

  constructor(
    categoryUiPort: CategoryUiPort,
    categoryApiPort?: CategoryApiPort,
    apiConfig?: ApiConfig
  ) {
    this.categoryUiPort = categoryUiPort;
    this.categoryApiPort =
      categoryApiPort ||
      new CategoryApiClient(
        apiConfig || {
          baseURL: process.env.API_BASE_URL || CATEGORY_CONFIG.DEFAULT_API_URL,
        }
      );
  }

  // Utility methods for normalization and validation
  private normalizeType(type: string): string {
    return (type || CATEGORY_CONFIG.DEFAULT_TYPE).toUpperCase();
  }

  private normalizeIcon(icon: string): string {
    return icon || CATEGORY_CONFIG.DEFAULT_ICON;
  }

  private validateCategoryName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new CategoryValidationError("Category name cannot be empty");
    }
    if (name.length > CATEGORY_CONFIG.MAX_NAME_LENGTH) {
      throw new CategoryValidationError(
        `Category name exceeds maximum length of ${CATEGORY_CONFIG.MAX_NAME_LENGTH} characters`
      );
    }
  }

  private async findCategoryByName(name: string): Promise<Category | null> {
    try {
      const categories = await this.categoryApiPort.getAllCategories();
      return categories.find((cat: Category) => cat.name === name) || null;
    } catch (error) {
      logger.error(`Failed to search for category '${name}'`, { error });
      throw error;
    }
  }

  private async createParentCategoryViaApi(
    parentName: string,
    icon: string,
    type: string
  ): Promise<Category> {
    const normalizedType = this.normalizeType(type);
    const normalizedIcon = this.normalizeIcon(icon);

    const categoryInput: Category = {
      id: "",
      name: parentName,
      icon: normalizedIcon,
      type: normalizedType,
    };

    try {
      return await this.categoryApiPort.createCategory(categoryInput);
    } catch (error) {
      throw new CategoryCreationError(parentName, error as Error);
    }
  }

  private async verifyCreation(categoryName: string): Promise<Category> {
    const createdCategory = await this.findCategoryByName(categoryName);
    if (!createdCategory) {
      throw new CategoryNotFoundError(categoryName);
    }
    return createdCategory;
  }

  /**
   * Ensures a parent category exists via backend API, returns its id
   * @param parentName - Name of the parent category
   * @param icon - Icon for the parent category
   * @param type - Type of the parent category
   * @param trackCreatedCategory - Optional callback to track created categories
   * @returns Promise resolving to the parent category ID
   */
  async ensureParentCategoryExists(
    parentName: string,
    icon: string,
    type: string,
    trackCreatedCategory?: TrackingCallback
  ): Promise<string> {
    logger.debug(`Ensuring parent category exists`, { parentName, icon, type });

    try {
      // Check if parent already exists
      const existingParent = await this.findCategoryByName(parentName);

      if (existingParent) {
        logger.debug(`Parent category already exists`, {
          parentName,
          id: existingParent.id,
        });
        if (trackCreatedCategory) {
          await trackCreatedCategory(existingParent.id, parentName, {
            isParent: true,
          });
        }
        return existingParent.id;
      }

      // Create parent category
      logger.info(`Creating parent category via API`, { parentName });
      const createdParent = await this.createParentCategoryViaApi(
        parentName,
        icon,
        type
      );

      // Track creation if callback provided
      if (trackCreatedCategory) {
        await trackCreatedCategory(createdParent.id, parentName, {
          isParent: true,
        });
      }

      // Verify creation
      await this.verifyCreation(parentName);

      logger.info(`Parent category created successfully`, {
        parentName,
        id: createdParent.id,
      });

      return createdParent.id;
    } catch (error) {
      logger.error(`Failed to ensure parent category exists`, {
        parentName,
        error,
      });
      throw error;
    }
  }

  /**
   * Creates a category with comprehensive options
   * @param name - Category name
   * @param icon - Category icon
   * @param type - Category type
   * @param options - Additional options for creation
   * @returns Promise resolving to category ID or void if expectError is true
   */
  async createCategory(
    name: string,
    icon: string,
    type: string,
    options: CreateCategoryOptions = {}
  ): Promise<string | void> {
    const { parent, expectError = false, trackCreatedCategory } = options;

    logger.debug(`Creating category via UI`, {
      name,
      icon,
      type,
      parent,
      expectError,
    });

    try {
      this.validateCategoryName(name);

      await this.categoryUiPort.navigateToCategoryPage();
      const result = await this.categoryUiPort.createCategory(
        name,
        icon,
        type,
        parent,
        expectError
      );

      if (!expectError && result && trackCreatedCategory) {
        await trackCreatedCategory(result, name);
      }

      if (!expectError) {
        this.lastCreatedCategoryName = name;
        logger.info(`Category created successfully via UI`, {
          name,
          id: result,
        });
      }

      return result;
    } catch (error) {
      logger.error(`Failed to create category via UI`, { name, error });
      throw error;
    }
  }

  /**
   * Creates a unique category with validation and tracking
   * @param name - Category name
   * @param icon - Category icon
   * @param type - Category type
   * @param options - Additional options for creation
   * @returns Promise resolving to category ID or void if expectError is true
   */
  async createUniqueCategory(
    name: string,
    icon: string,
    type: string,
    options: CreateCategoryOptions = {}
  ): Promise<string | void> {
    const { parent, expectError = false, trackCreatedCategory } = options;

    logger.debug(`Creating unique category`, {
      name,
      icon,
      type,
      parent,
      expectError,
    });

    try {
      this.validateCategoryName(name);

      const categoryId = await this.categoryUiPort.createUniqueCategory(
        name,
        icon,
        type,
        parent,
        expectError
      );

      if (trackCreatedCategory && categoryId) {
        logger.debug(`Tracking created category`, { name, id: categoryId });
        await trackCreatedCategory(categoryId.toString(), name);
      }

      if (!expectError) {
        logger.info(`Unique category created successfully`, {
          name,
          id: categoryId,
        });
      }

      return categoryId;
    } catch (error) {
      logger.error(`Failed to create unique category`, { name, error });
      throw error;
    }
  }

  /**
   * Coordinates: ensure parent exists (API), track it, then create and track child (UI)
   * When cleaning up, child should be deleted before parent.
   */
  async createCategoryWithParentWorkflow(
    name: string,
    icon: string,
    type: string,
    parent: string,
    trackCreatedCategory: TrackingCallback
  ): Promise<void> {
    logger.info(`Starting category with parent workflow`, { name, parent });

    try {
      // Ensure parent exists first
      await this.ensureParentCategoryExists(
        parent,
        icon,
        type,
        trackCreatedCategory
      );

      // Create and track child
      await this.createUniqueCategory(name, icon, type, {
        parent,
        trackCreatedCategory,
      });

      logger.info(`Category with parent workflow completed`, { name, parent });
    } catch (error) {
      logger.error(`Category with parent workflow failed`, {
        name,
        parent,
        error,
      });
      throw error;
    }
  }

  /**
   * Creates a child category via API with parent verification
   * @param name - Child category name
   * @param icon - Child category icon
   * @param type - Child category type
   * @param parent - Parent category name
   * @param trackCreatedCategory - Optional tracking callback
   * @param page - Optional Playwright page for UI verification
   */
  async createChildCategory(
    name: string,
    icon: string,
    type: string,
    parent: string,
    trackCreatedCategory?: TrackingCallback,
    page?: Page
  ): Promise<void> {
    logger.info(`Creating child category via API`, { name, parent });

    try {
      this.validateCategoryName(name);

      // Ensure parent exists and get its ID
      const parentId = await this.ensureParentCategoryExists(
        parent,
        icon,
        type,
        trackCreatedCategory
      );

      // Create the child category via backend API
      const categoryInput: Category = {
        id: "",
        name: name,
        icon: this.normalizeIcon(icon),
        type: this.normalizeType(type),
        parentId,
      };

      const createdCategory = await this.categoryApiPort.createCategory(
        categoryInput
      );

      if (trackCreatedCategory) {
        await trackCreatedCategory(createdCategory.id, name, {
          isParent: false,
        });
      }

      // Reload the page to ensure the UI reflects the new backend data
      if (page) {
        await page.reload();

        // Assert the new category is visible on the UI
        const isVisible = await this.isCategoryCreated(name);
        if (!isVisible) {
          throw new CategoryNotFoundError(
            `Category '${name}' was not found on the UI after backend creation and reload`
          );
        }
      }

      logger.info(`Child category created successfully`, {
        name,
        parent,
        id: createdCategory.id,
      });
    } catch (error) {
      logger.error(`Failed to create child category`, { name, parent, error });
      throw error;
    }
  }

  // Simplified methods with better error handling
  async isCategoryCreated(name: string): Promise<boolean> {
    try {
      return await this.categoryUiPort.isCategoryCreated(name);
    } catch (error) {
      logger.error(`Failed to check if category exists`, { name, error });
      throw error;
    }
  }

  async isCategoryChildOf(
    childName: string,
    parentName: string
  ): Promise<boolean> {
    try {
      return await this.categoryUiPort.isCategoryChildOf(childName, parentName);
    } catch (error) {
      logger.error(`Failed to check parent-child relationship`, {
        childName,
        parentName,
        error,
      });
      throw error;
    }
  }

  async createCategoryWithDuplicateName(
    name: string,
    icon: string,
    type: string
  ): Promise<void> {
    logger.debug(`Creating category with duplicate name (expecting error)`, {
      name,
    });
    await this.categoryUiPort.createCategory(name, icon, type, undefined, true);
  }

  async updateCategoryParent(
    categoryName: string,
    newParentName: string
  ): Promise<void> {
    try {
      await this.categoryUiPort.updateCategoryParent(
        categoryName,
        newParentName
      );
      logger.info(`Category parent updated`, { categoryName, newParentName });
    } catch (error) {
      logger.error(`Failed to update category parent`, {
        categoryName,
        newParentName,
        error,
      });
      throw error;
    }
  }

  async updateCategoryNameAndIcon(
    oldName: string,
    newName: string,
    newIcon: string
  ): Promise<void> {
    try {
      this.validateCategoryName(newName);
      await this.categoryUiPort.updateCategoryNameAndIcon(
        oldName,
        newName,
        newIcon
      );
      logger.info(`Category updated`, { oldName, newName, newIcon });
    } catch (error) {
      logger.error(`Failed to update category`, {
        oldName,
        newName,
        newIcon,
        error,
      });
      throw error;
    }
  }

  async deleteCategory(name: string): Promise<void> {
    try {
      await this.categoryUiPort.deleteCategory(name);
      logger.info(`Category deleted`, { name });
    } catch (error) {
      logger.error(`Failed to delete category`, { name, error });
      throw error;
    }
  }

  // Error checking methods
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

  // Navigation and listing methods
  async listCategories(): Promise<string[]> {
    try {
      return await this.categoryUiPort.listCategories();
    } catch (error) {
      logger.error(`Failed to list categories`, { error });
      throw error;
    }
  }

  async navigateToCategoryPage(): Promise<void> {
    await this.categoryUiPort.navigateToCategoryPage();
  }

  async assertOnCategoryPage(): Promise<void> {
    await this.categoryUiPort.assertOnCategoryPage();
  }

  // Specialized creation methods
  async createCategoryExpectingError(
    name: string,
    icon: string,
    type: string
  ): Promise<void> {
    await this.createUniqueCategory(name, icon, type, { expectError: true });
  }

  async attemptToCreateCategoryWithNameExceedingMaxLength(
    icon: string,
    type: string,
    onCreated?: (name: string) => void
  ): Promise<void> {
    const longName = this.generateUniqueName(
      CATEGORY_CONFIG.MAX_NAME_LENGTH + 1
    );
    if (onCreated) onCreated(longName);

    await this.createCategory(longName, icon, type, { expectError: true });
  }

  async createCategoryWithGeneratedName(
    length: number,
    icon: string,
    type: string,
    onCreated?: (name: string) => void
  ): Promise<string> {
    const name = this.generateUniqueName(length);
    if (onCreated) onCreated(name);

    await this.createCategory(name, icon, type);
    return name;
  }

  async attemptToCreateCategoryWithDuplicateName(
    icon: string,
    type: string,
    onCreated?: (name: string) => void
  ): Promise<void> {
    const duplicateName = this.lastCreatedCategoryName || "DuplicateCategory";
    if (onCreated) onCreated(duplicateName);

    await this.createCategory(duplicateName, icon, type, { expectError: true });
  }

  /**
   * Generates a unique name of a given length
   * @param length - Desired length of the name
   * @returns Generated unique name
   */
  public generateUniqueName(length: number): string {
    if (length <= 0) {
      throw new CategoryValidationError("Name length must be positive");
    }

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
