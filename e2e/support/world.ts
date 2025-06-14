import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "@playwright/test";

import { logger } from "./logger";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions<unknown>) {
    super(options);
  }

  async launchBrowser(browserName = "chromium") {
    try {
      const headlessEnv = process.env.HEADLESS;
      const headless = headlessEnv
        ? headlessEnv.toLowerCase() === "true"
        : true;
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

setWorldConstructor(CustomWorld);
