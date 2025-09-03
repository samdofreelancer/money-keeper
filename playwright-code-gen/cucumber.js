const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

module.exports = {
  default: {
    // Don't set default paths - let command line arguments control this
    // paths: ['src/features/**/*.feature'],
    require: ['reflect-metadata','src/shared/utilities/hooks.ts','src/domains/**/steps/*.ts'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    format: [
      'json:test-results/cucumber-report.json'
    ],
    parallel: parseInt(process.env.CUCUMBER_PARALLEL_WORKERS || '4'), // Enable parallel execution with 4 workers
    async onComplete() {
      const jsonReport = path.resolve(__dirname,'test-results/cucumber-report.json');
      if (fs.existsSync(jsonReport)) {
        reporter.generate({
          theme: 'bootstrap',
          jsonFile: jsonReport,
          output: path.resolve(__dirname,'test-results/cucumber-report.html'),
          reportSuiteAsScenarios: true,
          launchReport: false,
          metadata: {
            'Test Environment': process.env.NODE_ENV || 'development',
            Browser: process.env.BROWSER || 'chromium',
            Platform: process.platform,
            Parallel: process.env.CUCUMBER_PARALLEL_WORKERS || '1',
            Executed: 'Local',
          },
          screenshotsDirectory: 'test-results/screenshots/step-screenshots',
          storeScreenshots: true,
          screenshots: true,
        });
      }
    },
  },
};
