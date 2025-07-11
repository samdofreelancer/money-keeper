import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { CategoryDomain } from "../domain/CategoryDomain";
import { CategoryFormData } from "../types/CategoryTypes";
import { config } from "../config/env.config";
import { logger } from "./logger";

/**
 * Enhanced World class with better separation of concerns
 * Follows Single Responsibility Principle
 */
export class EnhancedCustomWorld extends World {
  // Browser infrastructure
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  
  // Domain services
  categoryDomain!: CategoryDomain;
  
  // Test data management
  uniqueData: Map<string, string> = new Map();
  createdCategoryNames: string[] = [];
  createdCategoryIds: string[] = [];
  
  // Test state
  pendingCategoryData?: CategoryFormData;
  lastError?: Error;
  
  // Configuration
  config = config;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Tracks a created category for cleanup
   */
  trackCreatedCategory(categoryId: string | null, categoryName: string): void {
    if (categoryId) {
      this.createdCategoryIds.push(categoryId);
    }
    this.createdCategoryNames.push(categoryName);
  }

  /**
   * Removes a category from tracking
   */
  removeFromTrackedCategories(categoryName: string): void {
    const index = this.createdCategoryNames.indexOf(categoryName);
    if (index > -1) {
      this.createdCategoryNames.splice(index, 1);
    }
  }

  /**
   * Gets the last created category name
   */
  getLastCreatedCategory(): string | null {
    return this.createdCategoryNames.length > 0 
      ? this.createdCategoryNames[this.createdCategoryNames.length - 1]
      : null;
  }

  /**
   * Refreshes the category page to reflect backend changes
   */
  async refreshCategoryPage(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
    await this.page.locator('[data-testid="page-title"]').click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Cleans up test data
   */
  async cleanup(): Promise<void> {
    // Cleanup logic would go here
    // This could involve API calls to delete created categories
    logger.info("Cleaning up test data");
  }
}

setWorldConstructor(EnhancedCustomWorld);
