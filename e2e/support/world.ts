import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "@playwright/test";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions<unknown>) {
    super(options);
  }

  // To fix the warning about 'any' type, you can define a proper interface for options
  // or use 'unknown' and add type guards as needed.
  // For now, this suppresses the warning.

  async launchBrowser(browserName = "chromium") {
    switch (browserName) {
      case "chromium":
        this.browser = await chromium.launch({ headless: true });
        break;
      case "firefox":
        this.browser = await firefox.launch({ headless: true });
        break;
      case "webkit":
        this.browser = await webkit.launch({ headless: true });
        break;
      default:
        this.browser = await chromium.launch({ headless: true });
    }
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    await this.page.close();
    await this.context.close();
    await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);
