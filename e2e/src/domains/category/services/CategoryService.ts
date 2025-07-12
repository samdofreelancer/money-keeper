/**
 * Application Service for Category operations
 * Orchestrates use cases and domain logic
 */

import { Page } from "@playwright/test";

// import { CategoryEntity } from "../models/Category"; // Unused for now
import { CategoryFormValue } from "../models/CategoryFormData";
import { CategorySearchValue } from "../models/CategorySearchCriteria";
import { CategoryRepository } from "../infra/repositories/CategoryRepository";
import { CategoryUIActions } from "../infra/actions/CategoryUIActions";
import { logger } from "../../../support/logger";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private categoryUIActions: CategoryUIActions;
  private page: Page;
  private world: any;

  constructor(page: Page, world?: any) {
    this.page = page;
    this.world = world;
    this.categoryRepository = new CategoryRepository(page);
    this.categoryUIActions = new CategoryUIActions(page);
  }

  /**
   * Creates a new category
   */
  async createCategory(formData: CategoryFormValue): Promise<void> {
    logger.info(`Creating category: ${formData.name}`);

    // Validate form data
    const errors = formData.validate();
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    // Check for duplicate names
    const exists = await this.categoryRepository.isCategoryPresent(
      formData.name
    );
    if (exists) {
      logger.info(`Category "${formData.name}" already exists, skipping creation`);
      return; // Don't throw error, just return if it already exists
    }

    // Execute UI operations
    await this.categoryUIActions.openCreateDialog();
    await this.categoryUIActions.fillForm({
      name: formData.name,
      icon: formData.icon,
      type: formData.type,
      parentCategory: formData.parentCategory,
    });
    await this.categoryUIActions.submitForm();

    // Verify creation
    await this.categoryRepository.waitForCategoryToAppear(formData.name);
    
    // Register for cleanup
    this.registerCategoryForCleanup(formData.name);
  }

  private registerCategoryForCleanup(categoryName: string): void {
    if (this.world && this.world.trackCreatedCategory) {
      this.world.trackCreatedCategory(null, categoryName);
      logger.info(`Registered category "${categoryName}" for cleanup`);
    } else {
      logger.info(`Could not register category "${categoryName}" for cleanup - world not available`);
    }
  }

  /**
   * Updates an existing category
   */
  async updateCategory(
    originalName: string,
    formData: CategoryFormValue
  ): Promise<void> {
    logger.info(`Updating category: ${originalName} -> ${formData.name}`);

    // Validate form data
    const errors = formData.validate();
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    // Check for duplicate names (excluding the original name)
    if (originalName !== formData.name) {
      const exists = await this.categoryRepository.isCategoryPresent(
        formData.name
      );
      if (exists) {
        throw new Error("Category name already exists");
      }
    }

    // Execute UI operations
    await this.categoryUIActions.openEditDialog(originalName);
    await this.categoryUIActions.fillForm({
      name: formData.name,
      icon: formData.icon,
      type: formData.type,
      parentCategory: formData.parentCategory,
    });
    await this.categoryUIActions.submitForm();

    // Verify update
    await this.categoryRepository.waitForCategoryToAppear(formData.name);
  }

  /**
   * Deletes a category
   */
  async deleteCategory(categoryName: string): Promise<void> {
    logger.info(`Deleting category: ${categoryName}`);

    await this.categoryUIActions.openDeleteDialog(categoryName);
    await this.categoryUIActions.confirmDelete();

    await this.categoryRepository.waitForCategoryToDisappear(categoryName);
  }

  /**
   * Searches for categories
   */
  async searchCategories(criteria: CategorySearchValue): Promise<void> {
    logger.info(
      `Searching categories with criteria: ${JSON.stringify(criteria)}`
    );

    if (criteria.hasSearchTerm() && criteria.searchTerm) {
      await this.categoryUIActions.searchByTerm(criteria.searchTerm);
    }

    if (criteria.hasTypeFilter() && criteria.categoryType) {
      await this.categoryUIActions.filterByType(criteria.categoryType);
    }
  }

  /**
   * Checks if a category exists
   */
  async categoryExists(categoryName: string): Promise<boolean> {
    return await this.categoryRepository.isCategoryPresent(categoryName);
  }

  /**
   * Cancels current operation
   */
  async cancelCurrentOperation(): Promise<void> {
    try {
      await this.categoryUIActions.cancelCurrentOperation();
      logger.info("Current operation cancelled successfully");
    } catch (error) {
      logger.info("No active operation to cancel or already closed");
      // Don't throw error for cancellation - it's often expected to fail
    }
  }

  /**
   * Opens create dialog for testing
   */
  async openCreateDialog(): Promise<void> {
    await this.categoryUIActions.openCreateDialog();
  }

  /**
   * Opens edit dialog for testing
   */
  async openEditDialog(categoryName: string): Promise<void> {
    await this.categoryUIActions.openEditDialog(categoryName);
  }

  /**
   * Opens delete dialog for testing
   */
  async openDeleteDialog(categoryName: string): Promise<void> {
    await this.categoryUIActions.openDeleteDialog(categoryName);
  }

  /**
   * Clears all categories for testing purposes
   */
  async clearAllCategories(): Promise<void> {
    try {
      const { getAllCategories, deleteCategory } = await import("../../../api/categoryApiHelper");
      const allCategories = await getAllCategories();
      
      logger.info(`Clearing ${allCategories.length} categories`);
      
      const deletePromises = allCategories.map((category: any) => deleteCategory(category.id));
      await Promise.all(deletePromises);
      
      logger.info("All categories cleared successfully");
    } catch (error) {
      logger.error("Error clearing categories:", error);
    }
  }
}
