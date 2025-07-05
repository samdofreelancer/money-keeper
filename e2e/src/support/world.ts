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
import { BasePage } from "../pages";
import { CategoryPage } from "../pages/category.page";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  currentPage!: BasePage;
  categoryPage?: CategoryPage;
  createdCategoryNames: string[] = [];
  createdCategoryIds: string[] = [];
  uniqueData: Map<string, string> = new Map();
  playwrightOptions?: PlaywrightTestOptions;

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
    const browserVersion = this.browser ? await this.browser.version() : "unknown";
    const userAgent = this.page ? await this.page.evaluate(() => navigator.userAgent) : "unknown";

    // Simple parsing of userAgent to get platform and device type
    let deviceType = "desktop";
    if (/Mobi|Android/i.test(userAgent)) {
      deviceType = "smart device";
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
}

setWorldConstructor(CustomWorld);
