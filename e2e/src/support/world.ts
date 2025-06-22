import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "@playwright/test";

import { config } from "../config/env.config";
import { logger } from "./logger";
import { BasePage } from "../pages";

export interface CustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  currentPage: BasePage;
  createdCategoryNames: string[];
  uniqueData: Map<string, string>;
}

export class CustomWorldContext extends World implements CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  currentPage!: BasePage;
  createdCategoryNames: string[] = [];
  uniqueData: Map<string, string>;

  constructor(options: IWorldOptions) {
    super(options);
    this.uniqueData = new Map<string, string>();
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
      console.error("Error closing browser:", error);
      throw error;
    }
  }
}

setWorldConstructor(CustomWorldContext);
