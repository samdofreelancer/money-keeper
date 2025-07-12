/**
 * Category Application Service
 * Orchestrates domain logic and coordinates between layers
 * This is the main entry point for category-related operations in tests
 */

import { Page } from "@playwright/test";

import {
  CategoryEntity,
  Category,
  CategoryCreate,
} from "../../domain/models/category.model";
import { CategoryFormValue } from "../../domain/value-objects/category-form-data.vo";
import { CategorySearchValue } from "../../domain/value-objects/category-search-criteria.vo";
import { CategoryApiClient } from "../../infrastructure/api/category-api-client";
import { CategoryUIActions } from "../../infrastructure/actions/CategoryUIActions";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository";
import { logger } from "../../../../shared/utils/logger";

export class CategoryApplicationService {
  private apiClient: CategoryApiClient;
  private uiActions: CategoryUIActions;
  private repository: CategoryRepository;
  private world: any;

  constructor(page: Page, world?: any) {
    const apiBaseUrl = process.env.API_BASE_URL || "http://127.0.0.1:8080/api";
    this.apiClient = new CategoryApiClient({ baseURL: apiBaseUrl });
    this.uiActions = new CategoryUIActions(page);
    this.repository = new CategoryRepository(page);
    this.world = world;
  }

  /**
   * Create a new category through the UI
   */
  async createCategoryThroughUI(formData: CategoryFormValue): Promise<void> {
    logger.info(`Creating category through UI: ${formData.name}`);

    // Validate form data
    const errors = formData.validate();
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    // Check for duplicates through API (faster than UI)
    const existingCategories = await this.apiClient.getAllCategories();
    const duplicateExists = existingCategories.some(
      (cat) => cat.name === formData.name
    );

    if (duplicateExists) {
      logger.info(
        `Category "${formData.name}" already exists, skipping creation`
      );
      this.registerForCleanup(formData.name);
      return;
    }

    // Execute UI operations
    await this.uiActions.openCreateDialog();
    await this.uiActions.fillForm({
      name: formData.name,
      icon: formData.icon,
      type: formData.type,
      parentCategory: formData.parentCategory,
    });
    await this.uiActions.submitForm();

    // Verify creation through repository
    await this.repository.waitForCategoryToAppear(formData.name);

    // Register for cleanup
    this.registerForCleanup(formData.name);

    logger.info(`Category "${formData.name}" created successfully`);
  }

  /**
   * Create a category directly through API (for test setup)
   */
  async createCategoryThroughAPI(
    categoryData: CategoryCreate
  ): Promise<Category> {
    logger.info(`Creating category through API: ${categoryData.name}`);

    const category = await this.apiClient.createCategory(categoryData);
    this.registerForCleanup(category.name);

    return category;
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    originalName: string,
    formData: CategoryFormValue
  ): Promise<void> {
    logger.info(`Updating category: ${originalName} -> ${formData.name}`);

    const errors = formData.validate();
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    // Check for duplicate names (excluding the original)
    if (originalName !== formData.name) {
      const exists = await this.repository.isCategoryPresent(formData.name);
      if (exists) {
        throw new Error("Category name already exists");
      }
    }

    await this.uiActions.openEditDialog(originalName);
    await this.uiActions.fillForm({
      name: formData.name,
      icon: formData.icon,
      type: formData.type,
      parentCategory: formData.parentCategory,
    });
    await this.uiActions.submitForm();

    await this.repository.waitForCategoryToAppear(formData.name);
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryName: string): Promise<void> {
    logger.info(`Deleting category: ${categoryName}`);

    await this.uiActions.openDeleteDialog(categoryName);
    await this.uiActions.confirmDelete();
    await this.repository.waitForCategoryToDisappear(categoryName);

    this.removeFromCleanup(categoryName);
  }

  /**
   * Search for categories
   */
  async searchCategories(criteria: CategorySearchValue): Promise<void> {
    logger.info(
      `Searching categories with criteria: ${JSON.stringify(criteria)}`
    );

    if (criteria.hasSearchTerm() && criteria.searchTerm) {
      await this.uiActions.searchByTerm(criteria.searchTerm);
    }

    if (criteria.hasTypeFilter() && criteria.categoryType) {
      await this.uiActions.filterByType(criteria.categoryType);
    }
  }

  /**
   * Check if a category exists in the UI
   */
  async categoryExists(categoryName: string): Promise<boolean> {
    return await this.repository.isCategoryPresent(categoryName);
  }

  /**
   * Get all categories from API
   */
  async getAllCategories(): Promise<Category[]> {
    return await this.apiClient.getAllCategories();
  }

  /**
   * Clear all categories (for test cleanup)
   */
  async clearAllCategories(): Promise<void> {
    try {
      const allCategories = await this.apiClient.getAllCategories();
      logger.info(`Clearing ${allCategories.length} categories`);

      const deletePromises = allCategories.map((category) =>
        this.apiClient.deleteCategory(category.id)
      );
      await Promise.all(deletePromises);

      logger.info("All categories cleared successfully");
    } catch (error) {
      logger.error("Error clearing categories:", error);
    }
  }

  /**
   * Cancel current operation
   */
  async cancelCurrentOperation(): Promise<void> {
    try {
      await this.uiActions.cancelCurrentOperation();
      logger.info("Current operation cancelled successfully");
    } catch (error) {
      logger.info("No active operation to cancel or already closed");
    }
  }

  private registerForCleanup(categoryName: string): void {
    if (this.world && this.world.trackCreatedCategory) {
      this.world.trackCreatedCategory(null, categoryName);
      logger.info(`Registered category "${categoryName}" for cleanup`);
    }
  }

  private removeFromCleanup(categoryName: string): void {
    if (this.world && this.world.removeFromTrackedCategories) {
      this.world.removeFromTrackedCategories(categoryName);
      logger.info(`Removed category "${categoryName}" from cleanup tracking`);
    }
  }
}
