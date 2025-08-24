import fs from 'fs';
import path from 'path';
import { Logger } from './logger';

/**
 * Reporter utility for generating custom test reports
 */
export class Reporter {
  private static readonly reportDir = './test-results/reports';
  private static testResults: TestResult[] = [];
  private static startTime: number = 0;
  private static endTime: number = 0;

  /**
   * Initialize the reporter
   */
  public static init(): void {
    // Create report directory if it doesn't exist
    if (!fs.existsSync(Reporter.reportDir)) {
      fs.mkdirSync(Reporter.reportDir, { recursive: true });
    }

    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync('./test-results/screenshots')) {
      fs.mkdirSync('./test-results/screenshots', { recursive: true });
    }

    // Reset test results
    Reporter.testResults = [];

    // Record start time
    Reporter.startTime = Date.now();

    Logger.info('Reporter initialized');
  }

  /**
   * Add a test result
   * @param result The test result to add
   */
  public static addTestResult(result: TestResult): void {
    Reporter.testResults.push(result);
  }

  /**
   * Generate the report
   */
  public static generateReport(): void {
    // Record end time
    Reporter.endTime = Date.now();

    // Calculate statistics
    const totalTests = Reporter.testResults.length;
    const passedTests = Reporter.testResults.filter(
      r => r.status === 'PASSED'
    ).length;
    const failedTests = Reporter.testResults.filter(
      r => r.status === 'FAILED'
    ).length;
    const skippedTests = Reporter.testResults.filter(
      r => r.status === 'SKIPPED'
    ).length;
    const duration = (Reporter.endTime - Reporter.startTime) / 1000;

    // Create report data
    const reportData = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        duration,
        startTime: new Date(Reporter.startTime).toISOString(),
        endTime: new Date(Reporter.endTime).toISOString(),
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      },
      results: Reporter.testResults,
    };

    // Write report to file
    const reportPath = path.join(
      Reporter.reportDir,
      `report-${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    Logger.info(`Report generated: ${reportPath}`);
    Logger.info(
      `Test Summary: ${passedTests}/${totalTests} passed (${failedTests} failed, ${skippedTests} skipped)`
    );
  }
}

/**
 * Test result interface
 */
export interface TestResult {
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  errorMessage?: string;
  screenshot?: string;
  startTime: string;
  endTime: string;
}
