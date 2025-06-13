# BDD Framework with Cucumber + Playwright in TypeScript

## Overview
This project implements a BDD testing framework using Cucumber and Playwright with TypeScript. It supports parallel execution, device-specific tests (desktop and mobile), environment variable loading, screenshot capture after each step, and multiple cucumber HTML reports.

## Project Structure
- `features/desktop/` - Desktop browser feature files
- `features/mobile/` - Mobile browser feature files
- `steps/` - Step definitions
- `support/` - Hooks, world, global setup/teardown
- `reports/` - Test reports and screenshots

## Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Run tests:
   - Run all tests: `npm run test`
   - Run tests in parallel: `npm run test:parallel`
3. Lint and fix issues:
   ```
   npm run lint
   npm run lint:fix
   ```

## Notes
- Environment variables are loaded once at test startup.
- Screenshots are taken after each step and saved in the reports/screenshots folder.
- Feature files are organized by device type for clarity.
- Reports are generated in multiple cucumber HTML format.

## Improvements
- Add more domain-specific step definitions and feature files as needed.
- Extend hooks for before/after scenario or feature lifecycle events.
- Organize steps and support files by domain or feature for scalability.

## Running Tests
- Use the cucumber CLI with the provided cucumber.js config for running tests with Cucumber.
- Playwright config supports device emulation and parallel execution.

## Contact
For questions or contributions, please contact the maintainer.
