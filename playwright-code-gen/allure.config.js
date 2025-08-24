module.exports = {
  resultsDir: 'test-results/allure-results',
  reportDir: 'test-results/allure-report',
  categories: [
    {
      name: 'Failed tests',
      matchedStatuses: ['failed']
    },
    {
      name: 'Broken tests',
      matchedStatuses: ['broken']
    },
    {
      name: 'Ignored tests',
      matchedStatuses: ['skipped']
    },
    {
      name: 'Passed tests',
      matchedStatuses: ['passed']
    }
  ],
  environmentInfo: {
    framework: 'Playwright + Cucumber',
    language: 'TypeScript',
    platform: process.platform,
    nodeVersion: process.version
  }
}; 