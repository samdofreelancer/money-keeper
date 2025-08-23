import { IFormatterOptions, EventDataCollector } from '@cucumber/cucumber';
import { allureReporter } from './allure-reporter';
import { writeFileSync } from 'fs';
import { join } from 'path';

export default class AllureFormatter {
  private options: IFormatterOptions;
  private eventDataCollector: EventDataCollector;

  constructor(options: IFormatterOptions) {
    this.options = options;
    this.eventDataCollector = new EventDataCollector(options.eventDataCollector);
  }

  onTestRunStarted(): void {
    console.log('🚀 Starting test run with Allure reporting...');
  }

  onTestCaseStarted(testCase: any): void {
    const scenarioName = testCase.name || 'Unknown Scenario';
    const featureName = testCase.sourceLocation?.uri || 'Unknown Feature';
    
    allureReporter.startTest(scenarioName, `Feature: ${featureName}`);
    allureReporter.addFeature(featureName);
    allureReporter.addEnvironmentInfo('Browser', process.env.BROWSER || 'chromium');
    allureReporter.addEnvironmentInfo('Platform', process.platform);
    
    console.log(`📝 Starting test: ${scenarioName}`);
  }

  onTestStepStarted(testStep: any): void {
    const stepName = testStep.text || 'Unknown Step';
    allureReporter.startStep(stepName);
    console.log(`  → ${stepName}`);
  }

  onTestStepFinished(testStep: any, result: any): void {
    const stepName = testStep.text || 'Unknown Step';
    let status: 'passed' | 'failed' | 'broken' = 'passed';
    
    if (result.status === 'FAILED') {
      status = 'failed';
      console.log(`  ❌ ${stepName} - FAILED`);
      
      if (result.exception) {
        allureReporter.addDescription(`Error: ${result.exception.message}`, 'text');
      }
    } else if (result.status === 'PENDING' || result.status === 'UNDEFINED') {
      status = 'broken';
      console.log(`  ⚠️  ${stepName} - ${result.status}`);
    } else {
      console.log(`  ✅ ${stepName} - PASSED`);
    }
    
    allureReporter.endStep(status);
  }

  onTestCaseFinished(testCase: any, result: any): void {
    const scenarioName = testCase.name || 'Unknown Scenario';
    let status: 'passed' | 'failed' | 'broken' | 'skipped' = 'passed';
    
    if (result.status === 'FAILED') {
      status = 'failed';
      console.log(`❌ Test failed: ${scenarioName}`);
    } else if (result.status === 'PENDING' || result.status === 'UNDEFINED') {
      status = 'broken';
      console.log(`⚠️  Test broken: ${scenarioName}`);
    } else if (result.status === 'SKIPPED') {
      status = 'skipped';
      console.log(`⏭️  Test skipped: ${scenarioName}`);
    } else {
      console.log(`✅ Test passed: ${scenarioName}`);
    }
    
    allureReporter.endTest(status);
  }

  onTestRunFinished(): void {
    console.log('🏁 Test run completed. Generating Allure report...');
    
    const environmentInfo = {
      framework: 'Playwright + Cucumber',
      language: 'TypeScript',
      platform: process.platform,
      nodeVersion: process.version,
      browser: process.env.BROWSER || 'chromium',
      parallel: process.env.CUCUMBER_PARALLEL_WORKERS || '1'
    };
    
    const envFile = join(process.cwd(), 'test-results', 'allure-results', 'environment.properties');
    const envContent = Object.entries(environmentInfo)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    writeFileSync(envFile, envContent);
    
    console.log('📊 Allure results generated successfully!');
    console.log('📁 Results location: test-results/allure-results');
    console.log('🌐 To view report, run: npm run allure:report');
  }
} 