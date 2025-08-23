import { allureReporter } from './allure-reporter';

/**
 * Allure annotation utilities for step definitions
 */
export class AllureAnnotations {
  /**
   * Add a description to the current test
   */
  static description(text: string): void {
    allureReporter.addDescription(text);
  }

  /**
   * Add a severity level to the current test
   */
  static severity(
    level: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'
  ): void {
    allureReporter.addSeverity(level);
  }

  /**
   * Add an epic label to the current test
   */
  static epic(name: string): void {
    allureReporter.addEpic(name);
  }

  /**
   * Add a feature label to the current test
   */
  static feature(name: string): void {
    allureReporter.addFeature(name);
  }

  /**
   * Add a story label to the current test
   */
  static story(name: string): void {
    allureReporter.addStory(name);
  }

  /**
   * Add an issue link to the current test
   */
  static issue(issueId: string): void {
    allureReporter.addIssue(issueId);
  }

  /**
   * Add a test ID to the current test
   */
  static testId(id: string): void {
    allureReporter.addTestId(id);
  }

  /**
   * Add a custom label to the current test
   */
  static label(name: string, value: string): void {
    allureReporter.addLabel(name, value);
  }

  /**
   * Add environment information to the current test
   */
  static environment(key: string, value: string): void {
    allureReporter.addEnvironmentInfo(key, value);
  }

  /**
   * Add an attachment to the current test
   */
  static attachment(
    name: string,
    type: string,
    content: Buffer | string
  ): void {
    allureReporter.addAttachment(name, type, content);
  }

  /**
   * Add a screenshot attachment
   */
  static screenshot(name: string, screenshotBuffer: Buffer): void {
    allureReporter.addAttachment(name, 'image/png', screenshotBuffer);
  }

  /**
   * Take and attach a screenshot from the current page
   */
  static async takeScreenshot(
    name: string,
    page: { screenshot: (options: { fullPage: boolean }) => Promise<Buffer> }
  ): Promise<void> {
    try {
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      allureReporter.addAttachment(name, 'image/png', screenshotBuffer);
    } catch (error) {
      console.error(`Failed to take screenshot: ${name}`, error);
    }
  }

  /**
   * Add a JSON attachment
   */
  static json(name: string, data: unknown): void {
    allureReporter.addAttachment(
      name,
      'application/json',
      JSON.stringify(data, null, 2)
    );
  }

  /**
   * Add a text attachment
   */
  static text(name: string, content: string): void {
    allureReporter.addAttachment(name, 'text/plain', content);
  }

  /**
   * Add an HTML attachment
   */
  static html(name: string, content: string): void {
    allureReporter.addAttachment(name, 'text/html', content);
  }

  /**
   * Add a step with automatic start/end tracking
   */
  static async step<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    allureReporter.startStep(name);
    try {
      const result = await fn();
      allureReporter.endStep('passed');
      return result;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
}

// Export individual functions for easier use
export const {
  description,
  severity,
  epic,
  feature,
  story,
  issue,
  testId,
  label,
  environment,
  attachment,
  screenshot,
  takeScreenshot,
  json,
  text,
  html,
} = AllureAnnotations;
