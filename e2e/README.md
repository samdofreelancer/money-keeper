# E2E Testing with Playwright & Cucumber

This project implements End-to-End testing using Playwright with Cucumber for BDD-style tests, with full TypeScript support and robust configuration management.

## 🛠 Tech Stack

- [Playwright](https://playwright.dev/) - Modern web testing framework
- [Cucumber](https://cucumber.io/) - BDD testing framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Winston](https://github.com/winstonjs/winston) - Logging framework

## 📝 Code Style & Formatting

### Line Endings Configuration
The project uses consistent line endings across different operating systems:

- `.gitattributes` enforces LF (Line Feed) line endings in the repository
- `.prettierrc` is configured with `"endOfLine": "auto"` to respect the OS defaults
- ESLint and Prettier work together to maintain consistent code style

New developers should:
1. Use the provided `.gitattributes` and `.prettierrc` configurations
2. Run `npm run lint:fix` before committing changes
3. Configure Git based on your OS:
   - Windows: `git config core.autocrlf true`
   - Linux/macOS: `git config core.autocrlf input`

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   └── env.config.ts   # Environment configuration
├── hooks/              # Cucumber hooks
│   ├── after.hooks.ts  # After scenario/feature hooks
│   ├── before.hooks.ts # Before scenario/feature hooks
│   └── screenshot.hooks.ts # Screenshot management
├── pages/              # Page Object Models
│   ├── base.page.ts    # Base page object class
│   └── index.ts        # Page object exports
├── step_definitions/   # Step implementations
│   └── common/        # Shared step definitions
├── support/            # Support files and setup
│   └── world.ts       # Cucumber World customization
├── types/             # TypeScript types
│   ├── config.types.ts # Configuration types
│   └── declarations/  # Global type declarations
└── utils/             # Utility functions
    └── validate-env.ts # Environment validation
```

## 🚀 Getting Started

1. Install dependencies:
   ```powershell
   npm install
   ```

2. Configure environment:
   - Copy `.env.example` to `.env`
   - Modify values as needed

3. Run tests:
   ```powershell
   npm test                # Run all tests
   npm run test:parallel   # Run tests in parallel
   ```

## 🔧 Configuration

All configuration is centralized in `src/config/env.config.ts`. The following environment variables are supported:

| Variable | Description | Default |
|----------|-------------|---------|
| SCREENSHOT_ON_SUCCESS | Take screenshots on successful steps | false |
| SCREENSHOT_ON_FAILURE | Take screenshots on failed steps | true |
| BROWSER_NAME | Browser to use (chromium/firefox/webkit) | chromium |
| HEADLESS | Run browser in headless mode | true |
| BASE_URL | Base URL for tests | http://localhost:3000 |
| ACTION_TIMEOUT | Timeout for Playwright actions | 0 (no timeout) |
| TRACE_MODE | Playwright trace mode | on-first-retry |
| TEST_TIMEOUT | Test timeout in milliseconds | 30000 |
| CI | Whether running in CI environment | undefined |

### Device Configurations

The framework supports both desktop and mobile testing with predefined device configurations:

```typescript
// Desktop configuration
{
  name: "Desktop Chrome",
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false
}

// Mobile configuration (Pixel 5)
{
  name: "Pixel 5",
  viewport: { width: 393, height: 851 },
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true
}
```

### Type System

The framework implements comprehensive TypeScript support:

```typescript
// Custom World Interface
interface ICustomWorld extends IWorld {
    page: Page;
    browser: Browser;
    context: BrowserContext;
    currentPage: BasePage;
}

// Environment Configuration
interface EnvironmentConfig {
    screenshotOnSuccess: boolean;
    browser: {
        name: string;
        headless: boolean;
        baseUrl: string;
    };
}
```

### Reports

Test reports are generated in:
- HTML Report: `reports/cucumber-html-report.html/index.html`
- JSON Report: `reports/cucumber-report.json`
- Screenshots: `reports/screenshots/`

### Logs

Logs are written to:
- Combined logs: `logs/combined.log`
- Error logs: `logs/error.log`

## 📝 Writing Tests

### Feature Files
```gherkin
Feature: Sample Feature

  Scenario: Basic test
    Given I open the homepage
    Then I should see the title "Example"
```

### Step Definitions
```typescript
Given("I open the homepage", async function (this: ICustomWorld) {
  await this.page.goto(config.browser.baseUrl);
});
```

### Page Objects
Extend BasePage for new page objects:
```typescript
export class HomePage extends BasePage {
  // Typed selectors
  private readonly titleSelector = 'h1';

  async getTitle(): Promise<string> {
    return await this.page.textContent(this.titleSelector) || '';
  }
}
```

## 🧪 Best Practices

1. **Type Safety**
   - Always use TypeScript types and interfaces
   - Avoid using `any` type
   - Define explicit return types for functions

2. **Page Objects**
   - Extend BasePage for common functionality
   - Use private fields for selectors
   - Implement methods that return promises

3. **Configuration**
   - Use environment variables for configuration
   - Validate configuration at startup
   - Keep configuration type-safe

4. **Testing**
   - Write descriptive feature files
   - Implement reusable step definitions
   - Use hooks for setup and teardown
   - Take screenshots on failures

## 🤝 Contributing

1. Create feature branch
2. Add or update tests
3. Ensure all tests pass
4. Submit pull request

## 📚 Learn More

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Cucumber Documentation](https://cucumber.io/docs/guides/overview/)
