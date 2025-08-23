import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Allure reporter that creates proper Allure format files
interface AllureTest {
  uuid: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  status: 'passed' | 'failed' | 'broken' | 'skipped';
  statusDetails: Record<string, unknown>;
  stage: 'finished';
  start: number;
  stop: number | null;
  steps: AllureStep[];
  attachments: AllureAttachment[];
  parameters: AllureParameter[];
  labels: AllureLabel[];
  links: unknown[];
  duration?: number;
}

interface AllureStep {
  name: string;
  status: 'passed' | 'failed' | 'broken';
  statusDetails: Record<string, unknown>;
  stage: 'finished';
  start: number;
  stop: number | null;
  attachments: AllureAttachment[];
  duration?: number;
}

interface AllureAttachment {
  name: string;
  type: string;
  source: string;
}

interface AllureParameter {
  name: string;
  value: string;
}

interface AllureLabel {
  name: string;
  value: string;
}

export class AllureReporter {
  private resultsDir: string;
  private currentTest: AllureTest | null = null;
  private currentStep: AllureStep | null = null;
  private testResults: AllureTest[] = [];

  constructor() {
    this.resultsDir = join(process.cwd(), 'test-results', 'allure-results');
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  startTest(name: string, description?: string): AllureTest {
    this.currentTest = {
      uuid: this.generateUuid(),
      name,
      description,
      status: 'passed',
      statusDetails: {},
      stage: 'finished',
      start: Date.now(),
      stop: null,
      steps: [],
      attachments: [],
      parameters: [],
      labels: [],
      links: [],
    };
    return this.currentTest;
  }

  endTest(status: 'passed' | 'failed' | 'broken' | 'skipped' = 'passed'): void {
    if (this.currentTest) {
      this.currentTest.status = status;
      this.currentTest.stop = Date.now();
      this.currentTest.duration =
        this.currentTest.stop - this.currentTest.start;

      // Save test result to file in proper Allure format
      const testFile = join(
        this.resultsDir,
        `${this.currentTest.uuid}-result.json`
      );
      writeFileSync(testFile, JSON.stringify(this.currentTest, null, 2));

      this.testResults.push(this.currentTest);
      this.currentTest = null;
    }
  }

  startStep(name: string): AllureStep {
    if (this.currentTest) {
      this.currentStep = {
        name,
        status: 'passed',
        statusDetails: {},
        stage: 'finished',
        start: Date.now(),
        stop: null,
        attachments: [],
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
      this.currentStep.duration =
        this.currentStep.stop - this.currentStep.start;
      this.currentStep = null;
    }
  }

  addAttachment(name: string, type: string, content: Buffer | string): void {
    if (this.currentTest) {
      const attachmentId = this.generateUuid();
      const extension = this.getExtensionForType(type);
      const attachmentFile = join(
        this.resultsDir,
        `${attachmentId}-attachment${extension}`
      );

      if (Buffer.isBuffer(content)) {
        writeFileSync(attachmentFile, content);
      } else {
        writeFileSync(attachmentFile, content);
      }

      this.currentTest.attachments.push({
        name,
        type,
        source: `${attachmentId}-attachment${extension}`,
      });
    }
  }

  addStepAttachment(
    name: string,
    type: string,
    content: Buffer | string
  ): void {
    if (this.currentStep) {
      const attachmentId = this.generateUuid();
      const extension = this.getExtensionForType(type);
      const attachmentFile = join(
        this.resultsDir,
        `${attachmentId}-attachment${extension}`
      );

      if (Buffer.isBuffer(content)) {
        writeFileSync(attachmentFile, content);
      } else {
        writeFileSync(attachmentFile, content);
      }

      this.currentStep.attachments.push({
        name,
        type,
        source: `${attachmentId}-attachment${extension}`,
      });
    }
  }

  addEnvironmentInfo(key: string, value: string): void {
    if (this.currentTest) {
      this.currentTest.parameters.push({
        name: key,
        value,
      });
    }
  }

  addLabel(name: string, value: string): void {
    if (this.currentTest) {
      this.currentTest.labels.push({
        name,
        value,
      });
    }
  }

  addDescription(
    description: string,
    type: 'text' | 'html' | 'markdown' = 'text'
  ): void {
    if (this.currentTest) {
      this.currentTest.description = description;
      this.currentTest.descriptionHtml =
        type === 'html' ? description : undefined;
    }
  }

  addSeverity(
    severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'
  ): void {
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

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  private getExtensionForType(type: string): string {
    switch (type) {
      case 'image/png':
        return '.png';
      case 'image/jpeg':
      case 'image/jpg':
        return '.jpg';
      case 'application/json':
        return '.json';
      case 'text/plain':
        return '.txt';
      case 'text/html':
        return '.html';
      default:
        return '';
    }
  }
}

// Global instance
export const allureReporter = new AllureReporter();
