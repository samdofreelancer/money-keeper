# Allure Reporting Integration

This project has been integrated with Allure reporting to provide comprehensive test reporting capabilities.

## Features

- **Comprehensive Test Reports**: Detailed HTML reports with test results, steps, and attachments
- **Screenshot Integration**: Automatic screenshot capture on test failures
- **Environment Information**: Track browser, platform, and test environment details
- **Custom Annotations**: Add descriptions, severity levels, and custom labels
- **Step-by-Step Tracking**: Detailed step execution tracking
- **Attachment Support**: Add screenshots, JSON data, text, and HTML attachments

## Installation

The following dependencies have been installed:

```bash
npm install --save-dev allure-commandline allure-playwright rimraf
```

## Usage

### Running Tests with Allure

```bash
# Run tests and generate Allure report
npm run test:allure

# Run tests with Allure and open report
npm run test:allure && npm run allure:report
```

### Allure Commands

```bash
# Generate Allure report from results
npm run allure:generate

# Open Allure report in browser
npm run allure:report

# Serve Allure report (live mode)
npm run allure:serve

# Clean Allure results and reports
npm run allure:clean
```

## Configuration

### Allure Configuration (`allure.config.js`)

The project includes a custom Allure configuration with:

- Custom categories for test statuses
- Environment information tracking
- Framework and language metadata

### Cucumber Integration

The Cucumber configuration has been updated to include:

- Allure formatter integration
- Automatic test result collection
- Step-by-step execution tracking

## Using Allure Annotations in Step Definitions

### Basic Annotations

```typescript
import { description, severity, epic, feature, story } from '../shared/utilities/allure-annotations';

Given('I am on the login page', async function() {
  // Add test metadata
  description('User navigates to the login page');
  severity('critical');
  epic('Authentication');
  feature('User Login');
  story('Successful Login');
  
  // Test implementation
  await this.page.goto('/login');
});
```

### Adding Attachments

```typescript
import { screenshot, json, text } from '../shared/utilities/allure-annotations';

When('I fill in the login form', async function() {
  // Add form data as JSON attachment
  json('Login Form Data', {
    username: 'testuser',
    email: 'test@example.com'
  });
  
  // Fill form fields
  await this.page.fill('#username', 'testuser');
  await this.page.fill('#password', 'password123');
  
  // Take screenshot
  const screenshotBuffer = await this.page.screenshot();
  screenshot('Login Form Filled', screenshotBuffer);
});
```

### Using Step Wrapper

```typescript
import { step } from '../shared/utilities/allure-annotations';

Then('I should see the dashboard', async function() {
  await step('Verify dashboard elements are visible', async () => {
    await this.page.waitForSelector('.dashboard-header');
    await this.page.waitForSelector('.dashboard-content');
  });
  
  await step('Check user information is displayed', async () => {
    const userInfo = await this.page.textContent('.user-info');
    expect(userInfo).toContain('Welcome, testuser');
  });
});
```

### Error Handling with Attachments

```typescript
import { screenshot, text } from '../shared/utilities/allure-annotations';

Then('I should see an error message', async function() {
  try {
    await this.page.waitForSelector('.error-message', { timeout: 5000 });
  } catch (error) {
    // Capture screenshot on error
    const screenshotBuffer = await this.page.screenshot();
    screenshot('Error State Screenshot', screenshotBuffer);
    
    // Add error details
    text('Error Details', error.message);
    
    throw error;
  }
});
```

## Report Structure

### Test Categories

- **Failed tests**: Tests that failed during execution
- **Broken tests**: Tests with implementation issues
- **Ignored tests**: Skipped or pending tests
- **Passed tests**: Successfully executed tests

### Environment Information

The report includes:

- Framework: Playwright + Cucumber
- Language: TypeScript
- Platform: Operating system details
- Browser: Test browser information
- Node Version: Runtime version

### Attachments

Supported attachment types:

- **Screenshots**: PNG images (automatic on failures)
- **JSON Data**: Structured data for debugging
- **Text Files**: Log files and error messages
- **HTML Content**: Page source or custom HTML

## Best Practices

### 1. Use Descriptive Annotations

```typescript
// Good
description('User successfully logs in with valid credentials');
severity('critical');
epic('User Management');

// Avoid
description('Test login');
```

### 2. Add Relevant Attachments

```typescript
// Add context to failures
When('the login fails', async function() {
  try {
    await this.page.click('#login-button');
  } catch (error) {
    const screenshot = await this.page.screenshot();
    screenshot('Login Failure State', screenshot);
    text('Error Message', error.message);
    throw error;
  }
});
```

### 3. Use Step Wrapper for Complex Operations

```typescript
// Break down complex steps
When('I complete the registration process', async function() {
  await step('Fill personal information', async () => {
    await this.page.fill('#name', 'John Doe');
    await this.page.fill('#email', 'john@example.com');
  });
  
  await step('Fill address information', async () => {
    await this.page.fill('#address', '123 Main St');
    await this.page.fill('#city', 'New York');
  });
  
  await step('Submit registration form', async () => {
    await this.page.click('#submit');
  });
});
```

### 4. Add Environment Context

```typescript
// Add relevant environment information
Before(async function() {
  environment('Browser', process.env.BROWSER || 'chromium');
  environment('Test Environment', process.env.NODE_ENV || 'development');
  environment('Parallel Workers', process.env.CUCUMBER_PARALLEL_WORKERS || '1');
});
```

## Troubleshooting

### Common Issues

1. **Allure command not found**
   ```bash
   # Install Allure globally
   npm install -g allure-commandline
   ```

2. **No results generated**
   - Ensure tests are running with the Allure formatter
   - Check that `test-results/allure-results` directory exists

3. **Report not opening**
   ```bash
   # Try serving instead of opening
   npm run allure:serve
   ```

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=allure* npm run test:allure
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run Tests with Allure
  run: npm run test:allure

- name: Generate Allure Report
  run: npm run allure:generate

- name: Upload Allure Report
  uses: actions/upload-artifact@v2
  with:
    name: allure-report
    path: test-results/allure-report/
```

### Jenkins Pipeline Example

```groovy
stage('Test') {
  steps {
    sh 'npm run test:allure'
  }
  post {
    always {
      allure([
        includeProperties: false,
        jdk: '',
        properties: [],
        reportBuildPolicy: 'ALWAYS',
        results: [[path: 'test-results/allure-results']]
      ])
    }
  }
}
```

## File Structure

```
playwright-code-gen/
├── allure.config.js                 # Allure configuration
├── src/shared/utilities/
│   ├── allure-reporter.ts          # Core Allure reporter
│   ├── allure-formatter.ts         # Cucumber formatter
│   └── allure-annotations.ts       # Annotation utilities
├── test-results/
│   ├── allure-results/             # Raw Allure results
│   └── allure-report/              # Generated HTML report
└── package.json                    # Updated with Allure scripts
```

## Migration from Existing Reports

If you have existing Cucumber HTML reports, they will continue to work alongside Allure reports. The project now generates both:

- **Cucumber HTML Report**: `test-results/cucumber-report.html`
- **Allure Report**: `test-results/allure-report/`

Both reports provide different insights and can be used together for comprehensive test analysis. 