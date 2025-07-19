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

import { config } from "../shared/config/env.config";
import { logger } from "./logger";
import { BasePage } from "../shared/infrastructure/pages/base.page";
import { AccountFormValue } from "../domains/account/domain/value-objects/account-form-data.vo";
import { AccountPort } from "../domains/account/domain/ports/ui/create-account-ui.port";
import { CreateAccountPlaywrightPage } from "../domains/account/infrastructure/pages/create-account.playwright.page";
import { AccountUseCasesFactory } from "../domains/account/application/use-cases";
import {
  DomainEvent,
  AccountCreatedEvent,
  AccountDeletedEvent,
  CategoryCreatedEvent,
  CategoryDeletedEvent,
} from "../shared/domain/events";

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
  playwrightOptions?: PlaywrightTestOptions;

  // Domain services (new architecture)
  accountService?: {
    create(account: unknown): Promise<unknown>;
  };

  // Domain UI ports (new architecture)
  accountUiPort?: AccountPort;

  // Use case factories (convenience)
  useCases?: AccountUseCasesFactory;

  // Event handlers map
  private eventHandlers: Map<
    string,
    ((event: DomainEvent) => Promise<void>)[]
  > = new Map();

  // Test data management
  createdCategoryNames: string[] = [];
  createdCategoryIds: string[] = [];
  createdParentCategoryIds: string[] = [];
  createdAccountNames: string[] = [];
  createdAccountIds: string[] = [];
  uniqueData: Map<string, string> = new Map();

  // Test state
  currentFormData?: AccountFormValue | Record<string, unknown>; // Allow form data for account and generic forms
  currentCategoryName?: string;
  newCategoryName?: string;
  newIcon?: string;
  lastError?: Error;

  // Configuration
  config = config;

  constructor(
    options: IWorldOptions & {
      attach: (data: string | Buffer, mimeType: string) => void;
    }
  ) {
    super(options);
  }

  // Fix for forbidden non-null assertion warning on line 88
  getEventHandlers(
    eventType: string
  ): ((event: DomainEvent) => Promise<void>)[] {
    return this.eventHandlers.get(eventType) ?? [];
  }

  // Event registration
  on(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.push(handler);
    }
  }

  // Event dispatching
  async emit(event: DomainEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    for (const handler of handlers) {
      await handler(event);
    }
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

      // Initialize account UI port
      this.accountUiPort = new CreateAccountPlaywrightPage(this.page);

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
  /**
   * Tracks a created category for cleanup, with support for parent/child distinction.
   * If opts.isParent is true, stores in createdParentCategoryIds for correct cleanup order.
   */
  async trackCreatedCategory(
    categoryId: string | null,
    categoryName: string,
    opts?: { isParent?: boolean }
  ): Promise<void> {
    if (!this.createdCategoryIds) this.createdCategoryIds = [];
    if (!this.createdCategoryNames) this.createdCategoryNames = [];
    if (!this.createdParentCategoryIds) this.createdParentCategoryIds = [];

    if (categoryId) {
      if (opts?.isParent) {
        this.createdParentCategoryIds.push(categoryId);
      } else {
        this.createdCategoryIds.push(categoryId);
      }
    }
    this.createdCategoryNames.push(categoryName);
    await this.emit(
      new CategoryCreatedEvent({
        categoryName,
        categoryId: categoryId ?? undefined,
      })
    );
  }

  /**
   * Removes a category from tracking
   */
  async removeFromTrackedCategories(categoryName: string): Promise<void> {
    const index = this.createdCategoryNames.indexOf(categoryName);
    if (index > -1) {
      this.createdCategoryNames.splice(index, 1);
      await this.emit(new CategoryDeletedEvent({ categoryName }));
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
   * Tracks a created account for cleanup
   */
  async trackCreatedAccount(
    accountName: string,
    accountId?: string
  ): Promise<void> {
    if (!this.createdAccountNames.includes(accountName)) {
      this.createdAccountNames.push(accountName);
    }

    if (accountId) {
      if (!this.createdAccountIds) {
        this.createdAccountIds = [];
      }
      if (!this.createdAccountIds.includes(accountId)) {
        this.createdAccountIds.push(accountId);
        logger.info(`Tracked account ID for cleanup: ${accountId}`);
      }
    }
    await this.emit(new AccountCreatedEvent({ accountName, accountId }));
  }

  /**
   * Removes an account from tracking
   */
  async removeFromTrackedAccounts(accountName: string): Promise<void> {
    const index = this.createdAccountNames.indexOf(accountName);
    if (index > -1) {
      this.createdAccountNames.splice(index, 1);
      await this.emit(new AccountDeletedEvent({ accountName }));
    }
  }

  /**
   * Gets the last created account name
   */
  getLastCreatedAccount(): string | null {
    return this.createdAccountNames.length > 0
      ? this.createdAccountNames[this.createdAccountNames.length - 1]
      : null;
  }

  /**
   * Gets the use cases factory or throws an error if not initialized
   */
  getUseCasesOrThrow(): AccountUseCasesFactory {
    if (!this.useCases) {
      throw new Error(
        "Use cases not initialized. Please ensure account management access was set up."
      );
    }
    return this.useCases;
  }
}

setWorldConstructor(CustomWorld);
