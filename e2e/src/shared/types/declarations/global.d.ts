import { World as CucumberWorld } from "@cucumber/cucumber";
import { ITestCaseHookParameter } from "@cucumber/cucumber/lib/support_code_library_builder/types";
import { Browser, BrowserContext, Page } from "@playwright/test";

import { BasePage } from "../src/common/pages/base.page";

declare module "@cucumber/cucumber" {
  export interface IWorld {
    page: Page;
    browser: Browser;
    context: BrowserContext;
    currentPage: BasePage;
    launchBrowser(): Promise<void>;
    closeBrowser(): Promise<void>;
    attach(data: Buffer | string, mimeType: string): void;
  }

  export class World extends CucumberWorld implements IWorld {
    page: Page;
    browser: Browser;
    context: BrowserContext;
    currentPage: BasePage;
    constructor(options: {
      attach: (data: Buffer | string, mimeType: string) => void;
      parameters: Record<string, unknown>;
    });
    launchBrowser(): Promise<void>;
    closeBrowser(): Promise<void>;
    attach(data: Buffer | string, mimeType: string): void;
  }

  export interface Status {
    FAILED: string;
    PASSED: string;
    PENDING: string;
    SKIPPED: string;
    UNDEFINED: string;
    AMBIGUOUS: string;
  }

  export const Status: Status;

  export function Given(
    pattern: string | RegExp,
    code: (this: World, ...args: unknown[]) => Promise<void>
  ): void;
  export function When(
    pattern: string | RegExp,
    code: (this: World, ...args: unknown[]) => Promise<void>
  ): void;
  export function Then(
    pattern: string | RegExp,
    code: (this: World, ...args: unknown[]) => Promise<void>
  ): void;
  export function Before(code: (this: World) => Promise<void>): void;
  export function After(code: (this: World) => Promise<void>): void;
  export function AfterStep(
    code: (this: World, options: ITestCaseHookParameter) => Promise<void>
  ): void;
  export function setWorldConstructor(world: typeof World): void;
}
