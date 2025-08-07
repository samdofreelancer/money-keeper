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
import { Environment } from '../config/environment';
import { Logger } from './logger';
import { Reporter } from './reporter';
import { TestData } from './testData';

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
  return global.testWorld!.accountsPage;
};

export const getAccountUsecase = (): World['accountUsecase'] => {
  return global.testWorld!.accountUsecase;
};

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

/**
 * Launch the browser before all tests
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

  Logger.info('Test execution completed');
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

  try {
    // 'this' refers to the World instance in Cucumber hooks
    await (this as unknown as World).initialize();

    // Store the world instance globally for easy access
    global.testWorld = this as unknown as World;

    Logger.debug('Scenario initialized successfully');
  } catch (error) {
    Logger.error(`Error initializing scenario: ${scenarioName}`, error);
    throw error;
  }
});

/**
 * Close the context after each scenario
 */
After(async function (scenario) {
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

  Logger.testEnd(scenarioName, logStatus);

  try {
    // 'this' refers to the World instance in Cucumber hooks
    await (this as unknown as CucumberWorld).teardown();
    Logger.debug('Scenario teardown completed');
  } catch (error) {
    Logger.error('Error during scenario teardown', error);
  }

  // Cleanup test data
  try {
    TestData.cleanupTestData();
    Logger.debug('Test data cleanup completed');
  } catch (error) {
    Logger.error('Error during test data cleanup', error);
  }
});

/**
 * Capture screenshot after each step and attach to report
 */
AfterStep(async function (step) {
  const scenarioName =
    (this as unknown as ScenarioContext).scenarioName || 'unknown-scenario';
  const stepName = step.pickleStep?.text || 'unknown-step';

  try {
    // Create screenshot directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const screenshotDir = './test-results/screenshots/step-screenshots';

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Create unique filename
    const safeScenarioName = scenarioName.replace(/[^a-zA-Z0-9]/g, '-');
    const safeStepName = stepName.replace(/[^a-zA-Z0-9]/g, '-');
    const screenshotPath = path.join(
      screenshotDir,
      `${safeScenarioName}-${safeStepName}.png`
    );

    // Take screenshot
    await (this as unknown as CucumberWorld).getPage().screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    // Attach screenshot file path string to Cucumber report (for cucumber-html-reporter compatibility)
    await (this as unknown as CucumberWorld).attach(
      screenshotPath,
      'text/plain'
    );

    Logger.debug(`Screenshot captured for step: ${stepName}`);
  } catch (error) {
    Logger.error(`Failed to capture screenshot for step: ${stepName}`, error);
  }
});

/**
 * Get the current page instance
 */
export async function getPage(): Promise<Page> {
  return global.testWorld!.getPage();
}
