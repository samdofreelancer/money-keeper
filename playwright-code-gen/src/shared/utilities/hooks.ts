import { Before, After, BeforeAll, AfterAll, setWorldConstructor, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Page, BrowserType } from '@playwright/test';
import { World } from './world';
import { BaseWorld } from './base-world';
import { Environment } from '../config/environment';
import { Logger } from './logger';
import { Reporter } from './reporter';

// Set World constructor for Cucumber
setWorldConstructor(World);

// Export page objects and steps for backward compatibility
export const getAccountsPage = (): World['accountsPage'] => {
  return (global as any).testWorld.accountsPage;
};

export const getAccountSteps = (): World['accountSteps'] => {
  return (global as any).testWorld.accountSteps;
};

export const getAccountUsecase = (): World['accountUsecase'] => {
  return (global as any).testWorld.accountUsecase;
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
      slowMo: Environment.slowMo
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
Before(async function(scenario) {
  // Log scenario start
  const scenarioName = scenario.pickle.name;
  Logger.testStart(scenarioName);
  
  // Store scenario start time
  (this as any).scenarioStartTime = Date.now();
  (this as any).scenarioName = scenarioName;
  
  try {
    // 'this' refers to the World instance in Cucumber hooks
    await this.initialize();
    
    // Store the world instance globally for easy access
    (global as any).testWorld = this;
    
    Logger.debug('Scenario initialized successfully');
  } catch (error) {
    Logger.error(`Error initializing scenario: ${scenarioName}`, error);
    throw error;
  }
});

/**
 * Close the context after each scenario
 */
After(async function(scenario) {
  // Log scenario result
  const scenarioName = (this as any).scenarioName || scenario.pickle.name;
  const status = scenario.result?.status;
  const scenarioEndTime = Date.now();
  const scenarioStartTime = (this as any).scenarioStartTime || scenarioEndTime;
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
      const screenshot = await this.getPage().screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      // Attach screenshot to report
      await this.attach(screenshot, 'image/png');
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
    endTime: new Date(scenarioEndTime).toISOString()
  });
  
  Logger.testEnd(scenarioName, logStatus);
  
  try {
    // 'this' refers to the World instance in Cucumber hooks
    await this.teardown();
    Logger.debug('Scenario teardown completed');
  } catch (error) {
    Logger.error('Error during scenario teardown', error);
  }
});

/**
 * Get the current page instance
 */
export async function getPage(): Promise<Page> {
  return (global as any).testWorld.getPage();
}