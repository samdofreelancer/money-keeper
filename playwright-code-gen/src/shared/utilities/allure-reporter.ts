import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Simple Allure reporter that creates JSON files compatible with Allure
export class AllureReporter {
  private resultsDir: string;
  private currentTest: any = null;
  private currentStep: any = null;
  private testResults: any[] = [];

  constructor() {
    this.resultsDir = join(process.cwd(), 'test-results', 'allure-results');
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  startTest(name: string, description?: string): any {
    this.currentTest = {
      name,
      description,
      status: 'passed',
      start: Date.now(),
      steps: [],
      labels: [],
      parameters: [],
      attachments: []
    };
    return this.currentTest;
  }

  endTest(status: 'passed' | 'failed' | 'broken' | 'skipped' = 'passed'): void {
    if (this.currentTest) {
      this.currentTest.status = status;
      this.currentTest.stop = Date.now();
      this.currentTest.duration = this.currentTest.stop - this.currentTest.start;
      
      // Save test result to file
      const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const testFile = join(this.resultsDir, `${testId}-result.json`);
      writeFileSync(testFile, JSON.stringify(this.currentTest, null, 2));
      
      this.testResults.push(this.currentTest);
      this.currentTest = null;
    }
  }

  startStep(name: string): any {
    if (this.currentTest) {
      this.currentStep = {
        name,
        status: 'passed',
        start: Date.now()
      };
      this.currentTest.steps.push(this.currentStep);
      return this.currentStep;
    }
    throw new Error('No active test to add step to');
  }

  endStep(status: 'passed' | 'failed' | 'broken' = 'passed'): void {
    if (this.currentStep) {
      this.currentStep.status = status;
      this.currentStep.stop = Date.now();
      this.currentStep.duration = this.currentStep.stop - this.currentStep.start;
      this.currentStep = null;
    }
  }

  addAttachment(name: string, type: string, content: Buffer | string): void {
    if (this.currentTest) {
      const attachmentId = `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const attachmentFile = join(this.resultsDir, `${attachmentId}-attachment`);
      
      if (Buffer.isBuffer(content)) {
        writeFileSync(attachmentFile, content);
      } else {
        writeFileSync(attachmentFile, content);
      }
      
      this.currentTest.attachments.push({
        name,
        type,
        source: `${attachmentId}-attachment`
      });
    }
  }

  addEnvironmentInfo(key: string, value: string): void {
    if (this.currentTest) {
      this.currentTest.parameters.push({
        name: key,
        value,
        kind: 'environment'
      });
    }
  }

  addLabel(name: string, value: string): void {
    if (this.currentTest) {
      this.currentTest.labels.push({
        name,
        value
      });
    }
  }

  addDescription(description: string, type: 'text' | 'html' | 'markdown' = 'text'): void {
    if (this.currentTest) {
      this.currentTest.description = description;
      this.currentTest.descriptionType = type;
    }
  }

  addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    this.addLabel('severity', severity);
  }

  addEpic(epic: string): void {
    this.addLabel('epic', epic);
  }

  addFeature(feature: string): void {
    this.addLabel('feature', feature);
  }

  addStory(story: string): void {
    this.addLabel('story', story);
  }

  addIssue(issue: string): void {
    this.addLabel('issue', issue);
  }

  addTestId(testId: string): void {
    this.addLabel('testId', testId);
  }
}

// Global instance
export const allureReporter = new AllureReporter(); 