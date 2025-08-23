# Allure Reporting - Quick Start Guide

## 🚀 Quick Commands

### Run Tests with Allure
```bash
npm run test:allure
```

### View Report
```bash
npm run allure:report
```

### Serve Live Report
```bash
npm run allure:serve
```

### Clean Results
```bash
npm run allure:clean
```

## 📊 What You Get

- **Beautiful HTML Reports** with test results, screenshots, and metadata
- **Test Categories** (Passed, Failed, Broken, Skipped)
- **Environment Information** (Browser, Platform, Node version)
- **Screenshot Capture** on test failures
- **Duration Tracking** for performance analysis
- **Custom Annotations** for better test documentation

## 🎯 Key Features

### Automatic Integration
- ✅ Tests are automatically tracked
- ✅ Screenshots captured on failures
- ✅ Environment info included
- ✅ Status mapping (passed/failed/broken/skipped)

### Manual Annotations
```typescript
import { description, severity, epic, feature, screenshot } from '../shared/utilities/allure-annotations';

Given('I am on the login page', async function() {
  description('User navigates to login page');
  severity('critical');
  epic('Authentication');
  feature('User Login');
  
  // Your test code here
});
```

## 📁 File Locations

- **Results**: `test-results/allure-results/`
- **Reports**: `test-results/allure-report/`
- **Configuration**: `allure.config.js`

## 🔧 Customization

Edit `allure.config.js` to customize:
- Test categories
- Environment information
- Report metadata

## 📖 Full Documentation

See `ALLURE_INTEGRATION.md` for complete documentation and examples.

---

**Ready to use!** 🎉 