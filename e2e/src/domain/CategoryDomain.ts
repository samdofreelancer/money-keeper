import { Page } from "@playwright/test";
import { CategoryFormData, CategorySearchCriteria } from "../types/CategoryTypes";
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
  async updateCategory(originalName: string, newData: CategoryFormData): Promise<void> {
    logger.info(`Updating category: ${originalName} -> ${newData.name}`);
    
    this.validationService.validateCategoryData(newData);
    
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
    logger.info(`Searching categories with criteria: ${JSON.stringify(criteria)}`);
    
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
    await this.categoryUIActions.cancelCurrentOperation();
  }
}
