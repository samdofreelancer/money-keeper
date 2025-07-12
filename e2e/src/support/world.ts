import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
  PlaywrightTestOptions,
} from "@playwright/test";

import { config } from "../config/env.config";
import { logger } from "./logger";
import { BasePage } from "../common/pages/base.page";
import { CategoryPage } from "../domains/category/infra/pages/category.page";
import { CategoryDomain } from "../domains/category/models/CategoryDomain";
import {
  CategoryName,
  CategoryIcon,
  CategoryType,
  ParentCategory,
} from "../domains/category/types/CategoryTypes";

/**
 * Unified World class with clean separation of concerns
 * Handles both legacy page object patterns and new domain-driven approach
 */
export class CustomWorld extends World {
  // Browser infrastructure
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Legacy page objects (for backward compatibility)
  currentPage!: BasePage;
  categoryPage?: CategoryPage;
  playwrightOptions?: PlaywrightTestOptions;

  // Domain services (new architecture)
  categoryDomain?: CategoryDomain;

  // Test data management
  createdCategoryNames: string[] = [];
  createdCategoryIds: string[] = [];
  uniqueData: Map<string, string> = new Map();

  // Test state
  pendingCategoryData?: {
    name: CategoryName;
    icon: CategoryIcon;
    type: CategoryType;
    parentCategory?: ParentCategory;
  };
  lastError?: Error;

  // Configuration
  config = config;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async launchBrowser(browserName = config.browser.name) {
    try {
      const { headless } = config.browser;

      switch (browserName) {
        case "chromium":
          this.browser = await chromium.launch({ headless });
          break;
        case "firefox":
          this.browser = await firefox.launch({ headless });
          break;
        case "webkit":
          this.browser = await webkit.launch({ headless });
          break;
        default:
          this.browser = await chromium.launch({ headless });
      }
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
      this.currentPage = new BasePage(this.page);
      logger.info(`Browser launched: ${browserName}`);
    } catch (error) {
      logger.error("Error launching browser:", error);
      throw error;
    }
  }

  async closeBrowser() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      logger.error("Error closing browser:", error);
      throw error;
    }
  }

  async getEnvironmentInfo() {
    const browserVersion = this.browser
      ? await this.browser.version()
      : "unknown";
    const userAgent = this.page
      ? await this.page.evaluate(() => navigator.userAgent)
      : "unknown";

    // Simple parsing of userAgent to get platform and device type
    let deviceType = "Desktop";
    if (/Mobi|Android/i.test(userAgent)) {
      deviceType = "Smart Device";
    }

    // Extract platform name and version from userAgent (basic)
    let platformName = "unknown";
    let platformVersion = "unknown";
    const platformMatch = userAgent.match(/\(([^)]+)\)/);
    if (platformMatch && platformMatch[1]) {
      const platformInfo = platformMatch[1].split(";");
      if (platformInfo.length > 0) {
        platformName = platformInfo[0].trim();
        if (platformInfo.length > 1) {
          platformVersion = platformInfo[1].trim();
        }
      }
    }

    // Browser name from config or fallback
    const browserName = config.browser.name || "unknown";

    return {
      browser: {
        name: browserName,
        version: browserVersion,
      },
      device: deviceType,
      platform: {
        name: platformName,
        version: platformVersion,
      },
    };
  }

  /**
   * Enhanced methods for improved BDD support
   */

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
    // Cleanup logic for test data
    // This could involve API calls to delete created categories
    logger.info("Cleaning up test data");
  }
}

setWorldConstructor(CustomWorld);
