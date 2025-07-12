import { Page } from "@playwright/test";

import {
  CategoryFormData,
  CategorySearchCriteria,
} from "../types/CategoryTypes";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { CategoryUIActions } from "../actions/CategoryUIActions";
import { CategoryValidationService } from "../services/CategoryValidationService";
import { logger } from "../support/logger";

/**
 * Domain layer for category operations following DDD principles
 * Encapsulates business logic and orchestrates interactions
 */
export class CategoryDomain {
  private categoryRepository: CategoryRepository;
  private categoryUIActions: CategoryUIActions;
  private validationService: CategoryValidationService;

  constructor(page: Page) {
    this.categoryRepository = new CategoryRepository(page);
    this.categoryUIActions = new CategoryUIActions(page);
    this.validationService = new CategoryValidationService();
  }

  /**
   * Creates a new category with business validation
   */
  async createCategory(categoryData: CategoryFormData): Promise<void> {
    logger.info(`Creating category: ${categoryData.name}`);

    // Business validation
    this.validationService.validateCategoryData(categoryData);

    // Check for duplicate names by checking existing categories
    const exists = await this.categoryRepository.isCategoryPresent(
      categoryData.name
    );
    if (exists) {
      throw new Error("Category name already exists");
    }

    // UI operations
    await this.categoryUIActions.openCreateDialog();
    await this.categoryUIActions.fillForm(categoryData);
    await this.categoryUIActions.submitForm();

    // Verify creation
    await this.categoryRepository.waitForCategoryToAppear(categoryData.name);
  }

  /**
   * Updates an existing category
   */
  async updateCategory(
    originalName: string,
    newData: CategoryFormData
  ): Promise<void> {
    logger.info(`Updating category: ${originalName} -> ${newData.name}`);

    this.validationService.validateCategoryData(newData);

    // Check for duplicate names (excluding the original name)
    if (originalName !== newData.name) {
      const exists = await this.categoryRepository.isCategoryPresent(
        newData.name
      );
      if (exists) {
        throw new Error("Category name already exists");
      }
    }

    await this.categoryUIActions.openEditDialog(originalName);
    await this.categoryUIActions.fillForm(newData);
    await this.categoryUIActions.submitForm();

    await this.categoryRepository.waitForCategoryToAppear(newData.name);
  }

  /**
   * Deletes a category with confirmation
   */
  async deleteCategory(categoryName: string): Promise<void> {
    logger.info(`Deleting category: ${categoryName}`);

    await this.categoryUIActions.openDeleteDialog(categoryName);
    await this.categoryUIActions.confirmDelete();

    await this.categoryRepository.waitForCategoryToDisappear(categoryName);
  }

  /**
   * Searches for categories based on criteria
   */
  async searchCategories(criteria: CategorySearchCriteria): Promise<void> {
    logger.info(
      `Searching categories with criteria: ${JSON.stringify(criteria)}`
    );

    if (criteria.searchTerm) {
      await this.categoryUIActions.searchByTerm(criteria.searchTerm);
    }

    if (criteria.categoryType) {
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
   * Opens the create dialog for testing purposes
   */
  async openCreateDialog(): Promise<void> {
    await this.categoryUIActions.openCreateDialog();
  }

  /**
   * Opens the edit dialog for testing purposes
   */
  async openEditDialog(categoryName: string): Promise<void> {
    await this.categoryUIActions.openEditDialog(categoryName);
  }

  /**
   * Opens the delete dialog for testing purposes
   */
  async openDeleteDialog(categoryName: string): Promise<void> {
    await this.categoryUIActions.openDeleteDialog(categoryName);
  }
}
