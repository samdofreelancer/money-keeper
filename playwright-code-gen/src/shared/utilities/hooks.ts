import 'reflect-metadata';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  AfterStep,
  setWorldConstructor,
  Status,
} from '@cucumber/cucumber';
import { chromium, firefox, webkit, Page, BrowserType } from '@playwright/test';
import { World } from './world';
import { BaseWorld } from './base-world';
import { Environment } from 'shared/config/environment';
import { Logger } from './logger';
import { Reporter } from './reporter';
import { TestData } from './testData';
import { CategoryDeletionApiUseCaseImpl } from 'category-domain/usecases/api/CategoryDeletionApiUseCase';

import { allureReporter } from './allure-reporter';
import { writeFileSync } from 'fs';
import { join } from 'path';

import fs from 'fs';
import { Container } from 'shared/di/container';
import { TOKENS } from 'shared/di/tokens';
import { autoImportDomains } from 'shared/di/auto-register';

// Extend the global object type
declare global {
  var testWorld: World | undefined;
}

// Define interface for scenario context properties
interface ScenarioContext {
  scenarioStartTime?: number;
  scenarioName?: string;
}

// Type assertion for Cucumber World instance
type CucumberWorld = World & {
  attach: (data: Buffer | string, mimeType: string) => Promise<void>;
};

// Set World constructor for Cucumber
setWorldConstructor(World);

// Export page objects and steps for backward compatibility
export const getAccountsPage = (): World['accountsPage'] => {
  if (!global.testWorld) {
    throw new Error(
      'World not initialized. Ensure tests are running in Cucumber context.'
    );
  }
  return global.testWorld.accountsPage;
};

// Transaction related getters
export const getTransactionsPage = (): World['transactionsPage'] => {
  if (!global.testWorld) {
    throw new Error(
      'World not initialized. Ensure tests are running in Cucumber context.'
    );
  }
  return global.testWorld.transactionsPage;
};

export const getTransactionCreationUiUseCase =
  (): World['transactionCreationUiUseCase'] => {
    if (!global.testWorld) {
      throw new Error(
        'World not initialized. Ensure tests are running in Cucumber context.'
      );
    }
    return global.testWorld.transactionCreationUiUseCase;
  };

// New use case getter functions with null checks
export const getAccountCreationApiUseCase =
  (): World['accountCreationApiUseCase'] => {
    if (!global.testWorld) {
      throw new Error(
        'World not initialized. Ensure tests are running in Cucumber context.'
      );
    }
    return global.testWorld.accountCreationApiUseCase;
  };

export const getAccountDeletionApiUseCase =
  (): World['accountDeletionApiUseCase'] => {
    if (!global.testWorld) {
      throw new Error(
        'World not initialized. Ensure tests are running in Cucumber context.'
      );
    }
    return global.testWorld.accountDeletionApiUseCase;
  };

export const getAccountBalanceUiUseCase =
  (): World['accountBalanceUiUseCase'] => {
    if (!global.testWorld) {
      throw new Error(
        'World not initialized. Ensure tests are running in Cucumber context.'
      );
    }
    return global.testWorld.accountBalanceUiUseCase;
  };

export const getAccountCreationUiUseCase =
  (): World['accountCreationUiUseCase'] => {
    if (!global.testWorld) {
      throw new Error(
        'World not initialized. Ensure tests are running in Cucumber context.'
      );
    }
    return global.testWorld.accountCreationUiUseCase;
  };

export const getWorldSettingsUseCase = (): World['settingsUiUseCase'] => {
  if (!global.testWorld) {
    throw new Error(
      'World not initialized. Ensure tests are running in Cucumber context.'
    );
  }
  return global.testWorld.settingsUiUseCase;
};

export const getCategoriesPage = (): World['categoriesPage'] => {
  if (!global.testWorld) {
    throw new Error(
      'World not initialized. Ensure tests are running in Cucumber context.'
    );
  }
  return global.testWorld.categoriesPage;
};

export const getCreateCategoryUseCase = (): World['createCategoryUseCase'] => {
  if (!global.testWorld) {
    throw new Error(
      'World not initialized. Ensure tests are running in Cucumber context.'
    );
  }
  return global.testWorld.createCategoryUseCase;
};

export const getCategoryApiClient = (): World['categoryApiClient'] => {
  if (!global.testWorld) {
    throw new Error(
      'World not initialized. Ensure tests are running in Cucumber context.'
    );
  }
  return global.testWorld.categoryApiClient;
};

let _categoryDeletionApiUseCase: CategoryDeletionApiUseCaseImpl | null = null;

export function getCategoryDeletionApiUseCase() {
  if (!_categoryDeletionApiUseCase) {
    // This function should be called within the context of a World instance
    // where the DI container is available
    if (!global.testWorld) {
      throw new Error(
        'World not initialized. Cannot get CategoryDeletionApiUseCase'
      );
    }
    _categoryDeletionApiUseCase = global.testWorld
      .categoryDeletionApiUseCase as CategoryDeletionApiUseCaseImpl;
  }
  return _categoryDeletionApiUseCase;
}

/**
 * Get browser type based on environment configuration
 */
function getBrowserType(): BrowserType {
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

let rootContainer: Container | undefined;

/**
 * Launch the browser before all tests and initialize root DI container
 */
BeforeAll(async () => {
  // Initialize reporter
  Reporter.init();

  Logger.info('Starting test execution');
  Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`Base URL: ${Environment.baseUrl}`);

  const browserType = getBrowserType();
  Logger.info(`Browser: ${browserType.name()}`);

  try {
    const browser = await browserType.launch({
      headless: Environment.headless,
      slowMo: Environment.slowMo,
    });

    BaseWorld.setBrowser(browser);
    Logger.info('Browser launched successfully');

    // Initialize root DI container and expose globally for decorators auto-register
    rootContainer = new Container();
    (globalThis as { __DI_CONTAINER__?: Container }).__DI_CONTAINER__ =
      rootContainer;

    // Auto-import decorated classes via fast-glob after container is set
    await autoImportDomains();

    // Optional: warm-up selected singletons in a temporary scope if needed
    // rootContainer.createScope().buildAllFromRegistry();
    Logger.info(
      '[DI] Root container initialized and services auto-registered via auto-import'
    );
  } catch (error) {
    Logger.error('Failed to launch browser', error);
    throw error;
  }
});

/**
 * Close the browser after all tests
 */
AfterAll(async () => {
  try {
    await BaseWorld.getBrowser().close();
    Logger.info('Browser closed successfully');
  } catch (error) {
    Logger.error('Error closing browser', error);
  }

  // Generate report
  Reporter.generateReport();

  // Generate Allure environment info
  const environmentInfo = {
    framework: 'Playwright + Cucumber',
    language: 'TypeScript',
    platform: process.platform,
    nodeVersion: process.version,
    browser: process.env.BROWSER || 'chromium',
    parallel: process.env.CUCUMBER_PARALLEL_WORKERS || '1',
  };

  const envFile = join(
    process.cwd(),
    'test-results',
    'allure-results',
    'environment.properties'
  );
  const envContent = Object.entries(environmentInfo)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  writeFileSync(envFile, envContent);

  Logger.info('Test execution completed');
  Logger.info('📊 Allure results generated successfully!');
  Logger.info('📁 Results location: test-results/allure-results');
  Logger.info('🌐 To view report, run: npm run allure:report');
});

/**
 * Create a new browser context and page before each scenario
 * and initialize domain-specific page objects
 */
Before(async function (scenario) {
  // Log scenario start
  const scenarioName = scenario.pickle.name;
  Logger.testStart(scenarioName);

  // Store scenario start time
  (this as ScenarioContext).scenarioStartTime = Date.now();
  (this as ScenarioContext).scenarioName = scenarioName;

  // Initialize Allure test
  allureReporter.startTest(
    scenarioName,
    `Feature: ${scenario.gherkinDocument?.feature?.name || 'Unknown Feature'}`
  );
  allureReporter.addFeature(
    scenario.gherkinDocument?.feature?.name || 'Unknown Feature'
  );
  allureReporter.addEnvironmentInfo(
    'Browser',
    process.env.BROWSER || 'chromium'
  );
  allureReporter.addEnvironmentInfo('Platform', process.platform);

  // Add scenario description
  if (scenario.pickle.steps) {
    const stepDescriptions = scenario.pickle.steps.map(s => s.text).join('\n');
    allureReporter.addDescription(`Steps:\n${stepDescriptions}`, 'text');
  }

  try {
    // 'this' refers to the World instance in Cucumber hooks
    await (this as unknown as World).initialize();

    // Create DI scope for this scenario
    if (!rootContainer) throw new Error('Root DI container not initialized');
    const scope = rootContainer.createScope();

    // Assign scope to world for lazy resolves in getters
    (this as unknown as World).container = scope;

    // Register runtime instances in the scope (Page/Request/ApiBaseUrl)
    const page = await (this as unknown as World).getPage();
    scope.registerInstance(TOKENS.Page, page);
    scope.registerInstance(TOKENS.Request, page.context().request);
    scope.registerInstance(
      TOKENS.ApiBaseUrl,
      process.env.API_BASE_URL || 'http://127.0.0.1:8080/api'
    );

    // Store the world instance globally for easy access
    global.testWorld = this as unknown as World;

    Logger.debug('Scenario initialized successfully with DI scope');
  } catch (error) {
    Logger.error(`Error initializing scenario: ${scenarioName}`, error);
    throw error;
  }
});

/**
 * Close the context after each scenario
 */
After(async function (scenario) {
  // Cleanup test data
  try {
    await TestData.cleanupAllViaApi(); // xóa Account + Category qua API
  } catch (error) {
    Logger.error('[Hooks] Error during API cleanup', error);
  } finally {
    TestData.clear();
    Logger.debug('[Hooks] Test data cleanup completed');
  }

  // Log scenario result
  const scenarioName =
    (this as unknown as ScenarioContext).scenarioName || scenario.pickle.name;
  const status = scenario.result?.status;
  const scenarioEndTime = Date.now();
  const scenarioStartTime =
    (this as unknown as ScenarioContext).scenarioStartTime || scenarioEndTime;
  const duration = (scenarioEndTime - scenarioStartTime) / 1000;

  // Screenshot path for failures
  let screenshotPath: string | undefined;

  // Take screenshot on failure
  if (status === Status.FAILED) {
    Logger.info(`Scenario failed: ${scenarioName}`);

    try {
      // Create screenshot filename
      screenshotPath = `./test-results/screenshots/${scenarioName.replace(/\s+/g, '-')}-failure.png`;

      // Take screenshot
      const screenshot = await (this as unknown as CucumberWorld)
        .getPage()
        .screenshot({
          path: screenshotPath,
          fullPage: true,
        });

      // Attach screenshot to report
      await (this as unknown as CucumberWorld).attach(screenshot, 'image/png');
      Logger.debug('Failure screenshot captured');
    } catch (error) {
      Logger.error('Failed to capture failure screenshot', error);
    }
  }

  // Map Cucumber status to logger status
  let logStatus: 'PASSED' | 'FAILED' | 'SKIPPED';
  switch (status) {
    case Status.PASSED:
      logStatus = 'PASSED';
      break;
    case Status.FAILED:
      logStatus = 'FAILED';
      break;
    default:
      logStatus = 'SKIPPED';
  }

  // Add test result to reporter
  Reporter.addTestResult({
    name: scenarioName,
    status: logStatus,
    duration,
    errorMessage: scenario.result?.message,
    screenshot: screenshotPath,
    startTime: new Date(scenarioStartTime).toISOString(),
    endTime: new Date(scenarioEndTime).toISOString(),
  });

  // End Allure test with appropriate status
  let allureStatus: 'passed' | 'failed' | 'broken' | 'skipped' = 'passed';
  switch (status) {
    case Status.PASSED:
      allureStatus = 'passed';
      break;
    case Status.FAILED:
      allureStatus = 'failed';
      break;
    case Status.SKIPPED:
      allureStatus = 'skipped';
      break;
    default:
      allureStatus = 'broken';
  }
  allureReporter.endTest(allureStatus);

  Logger.testEnd(scenarioName, logStatus);

  try {
    // 'this' refers to the World instance in Cucumber hooks
    await (this as unknown as CucumberWorld).teardown();

    // Clear DI scope runtime instances (drop reference to allow GC)
    if ((this as unknown as World).container) {
      (this as unknown as World).container.clearRuntimeInstances();
      (this as unknown as World).container = undefined as unknown as Container;
    }

    Logger.debug('Scenario teardown completed');
  } catch (error) {
    Logger.error('Error during scenario teardown', error);
  }
});

AfterStep(async function (step) {
  const scenarioName =
    (this as unknown as ScenarioContext).scenarioName || 'unknown-scenario';
  const stepName = step.pickleStep?.text || 'unknown-step';

  // Start Allure step
  allureReporter.startStep(stepName);

  try {
    // Create screenshot directory if it doesn't exist
    const path = require('path');
    const screenshotDir = './test-results/screenshots/step-screenshots';

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Create unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const safeScenarioName = scenarioName.replace(/[^a-zA-Z0-9]/g, '-');
    const safeStepName = stepName.replace(/[^a-zA-Z0-9]/g, '-');
    const screenshotPath = path.join(
      screenshotDir,
      `${safeScenarioName}-${safeStepName}-${timestamp}.png`
    );

    // Take screenshot
    const screenshotBuffer = await (this as unknown as CucumberWorld)
      .getPage()
      .screenshot({
        path: screenshotPath,
        fullPage: true,
      });

    // Attach screenshot buffer to Cucumber report for inline display
    await (this as unknown as CucumberWorld).attach(
      screenshotBuffer,
      'image/png'
    );

    // Attach screenshot to Allure report with descriptive name
    const allureScreenshotName = `${stepName} - ${new Date().toLocaleTimeString()}`;
    allureReporter.addStepAttachment(
      allureScreenshotName,
      'image/png',
      screenshotBuffer
    );

    // Add step description to Allure
    allureReporter.addDescription(
      `Screenshot captured for step: ${stepName}`,
      'text'
    );

    // End Allure step as passed
    allureReporter.endStep('passed');

    Logger.debug(
      `Screenshot captured and attached to Allure for step: ${stepName}`
    );
  } catch (error) {
    // End Allure step as failed
    allureReporter.endStep('failed');
    Logger.error(`Failed to capture screenshot for step: ${stepName}`, error);

    // Try to capture error screenshot
    try {
      const errorScreenshotBuffer = await (this as unknown as CucumberWorld)
        .getPage()
        .screenshot({
          fullPage: true,
        });

      allureReporter.addStepAttachment(
        `Error Screenshot: ${stepName}`,
        'image/png',
        errorScreenshotBuffer
      );

      Logger.debug(`Error screenshot captured for step: ${stepName}`);
    } catch (screenshotError) {
      Logger.error(
        `Failed to capture error screenshot for step: ${stepName}`,
        screenshotError
      );
    }
  }
});

/**
 * Get the current page instance
 */
export async function getPage(): Promise<Page> {
  return global.testWorld!.getPage();
}
