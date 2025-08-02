import { Browser, BrowserContext, Page, BrowserType } from '@playwright/test';
import { Environment } from '../config/environment';
import { chromium, firefox, webkit } from '@playwright/test';

/**
 * BaseWorld class to provide a foundation for domain-specific World classes
 * This class handles browser, context, and page management
 */
export class BaseWorld {
  // Method for attaching data to Cucumber reports
  // This will be implemented by Cucumber's World
  public attach: (data: Buffer | string, mimeType: string) => Promise<void> = async () => {
    // Default implementation does nothing
    // Will be overridden by Cucumber's World
  };
  // Browser instance (unique per scenario)
  protected browser!: Browser;
  
  // Context and page (unique per scenario)
  protected context!: BrowserContext;
  protected page!: Page;

  constructor() {
    // Will be initialized in initialize()
  }

  /**
   * Get browser type based on environment configuration
   */
  private getBrowserType(): BrowserType {
    const browserName = process.env.BROWSER || 'chromium';
    
    switch (browserName.toLowerCase()) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  /**
   * Create a new browser context and page with environment configuration
   */
  public async initialize(): Promise<void> {
    // Launch browser for this scenario
    const browserType = this.getBrowserType();
    this.browser = await browserType.launch({
      headless: Environment.headless,
      slowMo: Environment.slowMo
    });
    
    // Create context with environment configuration
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      baseURL: Environment.baseUrl,
      recordVideo: process.env.RECORD_VIDEO === 'true' ? {
        dir: './test-results/videos/',
        size: { width: 1280, height: 720 }
      } : undefined,
      // Add additional context options as needed
    });
    
    // Set default timeout from environment
    this.context.setDefaultTimeout(Environment.timeout);
    
    // Create page
    this.page = await this.context.newPage();
  }

  /**
   * Close the browser context and browser
   */
  public async teardown(): Promise<void> {
    // Close context
    if (this.context) {
      await this.context.close();
    }
    
    // Close browser
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Get the current page instance
   */
  public getPage(): Page {
    return this.page;
  }
}
