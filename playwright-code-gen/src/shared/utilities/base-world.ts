import { Browser, BrowserContext, Page } from '@playwright/test';
import { Environment } from 'shared/config/environment';

/**
 * BaseWorld class to provide a foundation for domain-specific World classes
 * This class handles browser, context, and page management
 */
export class BaseWorld {
  // Method for attaching data to Cucumber reports
  // This will be implemented by Cucumber's World
  public attach: (data: Buffer | string, mimeType: string) => Promise<void> =
    async () => {
      // Default implementation does nothing
      // Will be overridden by Cucumber's World
    };
  // Browser instance (shared across all tests)
  protected static browser: Browser;

  // Context and page (unique per scenario)
  protected context!: BrowserContext;
  protected page!: Page;

  constructor() {
    // Will be initialized in initialize()
  }

  /**
   * Set the browser instance
   */
  public static setBrowser(browser: Browser): void {
    BaseWorld.browser = browser;
  }

  /**
   * Get the browser instance
   */
  public static getBrowser(): Browser {
    return BaseWorld.browser;
  }

  /**
   * Create a new browser context and page with environment configuration
   */
  public async initialize(): Promise<void> {
    // Create context with environment configuration
    this.context = await BaseWorld.browser.newContext({
      viewport: { width: 1280, height: 720 },
      baseURL: Environment.baseUrl,
      recordVideo:
        process.env.RECORD_VIDEO === 'true'
          ? {
              dir: './test-results/videos/',
              size: { width: 1280, height: 720 },
            }
          : undefined,
      // Add additional context options as needed
    });

    // Set default timeout from environment
    this.context.setDefaultTimeout(Environment.timeout);

    // Create page
    this.page = await this.context.newPage();
  }

  /**
   * Close the browser context
   */
  public async teardown(): Promise<void> {
    await this.context.close();
  }

  /**
   * Get the current page instance
   */
  public getPage(): Page {
    return this.page;
  }
}
