import { Page } from "@playwright/test";

import { config } from "../../../shared/config/env.config";
import { logger } from "../../../support/logger";

export class BasePage {
  protected baseUrl: string;
  protected logger = logger;

  constructor(public page: Page) {
    this.baseUrl = config.browser.baseUrl;
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}
