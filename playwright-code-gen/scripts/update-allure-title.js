#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_DIR = path.join(__dirname, '..', 'test-results', 'allure-report');
const OLD_TITLE = 'Allure Report';
const NEW_TITLE = 'Money Keeper E2E Report';

// Files to update
const FILES_TO_UPDATE = [
  'index.html',
  'export/mail.html',
  'widgets/summary.json'
];

function updateFile(filePath, updateFunction) {
  const fullPath = path.join(REPORT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const updatedContent = updateFunction(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function updateHtmlTitle(content) {
  return content.replace(
    /<title>Allure Report<\/title>/g,
    `<title>${NEW_TITLE}</title>`
  );
}

function updateMailTitle(content) {
  return content.replace(
    /<title>Allure Report summary mail<\/title>/g,
    `<title>${NEW_TITLE} summary mail</title>`
  );
}

function updateJsonReportName(content) {
  return content.replace(
    /"reportName":"Allure Report"/g,
    `"reportName":"${NEW_TITLE}"`
  );
}

function main() {
  console.log('🚀 Updating Allure report title...');
  console.log(`📝 Changing "${OLD_TITLE}" to "${NEW_TITLE}"`);
  console.log('─'.repeat(50));

  if (!fs.existsSync(REPORT_DIR)) {
    console.error(`❌ Report directory not found: ${REPORT_DIR}`);
    console.log('💡 Please generate the Allure report first using: npm run allure:generate');
    process.exit(1);
  }

  let updatedCount = 0;

  // Update index.html
  if (updateFile('index.html', updateHtmlTitle)) {
    updatedCount++;
  }

  // Update mail.html
  if (updateFile('export/mail.html', updateMailTitle)) {
    updatedCount++;
  }

  // Update summary.json
  if (updateFile('widgets/summary.json', updateJsonReportName)) {
    updatedCount++;
  }

  console.log('─'.repeat(50));
  if (updatedCount > 0) {
    console.log(`🎉 Successfully updated ${updatedCount} file(s)`);
    console.log(`📊 Report title changed to: "${NEW_TITLE}"`);
  } else {
    console.log('ℹ️  No files needed updating');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { updateAllureTitle: main };
