#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Function to execute a command and measure its execution time
function executeCommand(command, description) {
  console.log(`\n🚀 ${description}`);
  console.log(`📝 Command: ${command}`);
  
  const startTime = Date.now();
  
  try {
    const result = execSync(command, { 
      stdio: 'inherit',
      cwd: path.dirname(__dirname) // Run from the playwright-code-gen directory
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(`✅ ${description} completed successfully`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    
    return {
      success: true,
      duration: duration
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ ${description} failed`);
    console.error(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.error(`💥 Error: ${error.message}`);
    
    return {
      success: false,
      duration: duration,
      error: error
    };
  }
}

// Main function to run the complete test workflow
async function runTestWorkflow() {
  console.log('='.repeat(60));
  console.log('🧪 STARTING TEST WORKFLOW WITH ALLURE REPORTING');
  console.log('='.repeat(60));
  
  const results = [];
  let overallSuccess = true;
  
  // 1. Clean allure results
  const cleanResult = executeCommand(
    'npm run allure:clean',
    'Cleaning Allure results and reports'
  );
  results.push(cleanResult);
  
  if (!cleanResult.success) {
    overallSuccess = false;
    console.log('❌ Workflow stopped due to cleanup failure');
    return { overallSuccess, results };
  }
  
  // 2. Run tests
  const testResult = executeCommand(
    'npm run test',
    'Running Cucumber tests'
  );
  results.push(testResult);
  
  if (!testResult.success) {
    overallSuccess = false;
    console.log('⚠️  Tests failed, but continuing with report generation');
    // Continue even if tests fail to generate the report
  }
  
  // 3. Generate Allure report
  const generateResult = executeCommand(
    'npm run allure:generate',
    'Generating Allure report'
  );
  results.push(generateResult);
  
  if (!generateResult.success) {
    overallSuccess = false;
    console.log('❌ Report generation failed');
    return { overallSuccess, results };
  }
  
  // 4. Open Allure report
  const reportResult = executeCommand(
    'npm run allure:report',
    'Opening Allure report in browser'
  );
  results.push(reportResult);
  
  if (!reportResult.success) {
    overallSuccess = false;
    console.log('⚠️  Could not open report in browser, but report was generated');
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST WORKFLOW SUMMARY');
  console.log('='.repeat(60));
  
  const steps = [
    'Clean Allure results',
    'Run Cucumber tests',
    'Generate Allure report', 
    'Open Allure report'
  ];
  
  let totalDuration = 0;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${steps[index]}: ${status} (${result.duration.toFixed(2)}s)`);
    totalDuration += result.duration;
  });
  
  console.log('─'.repeat(40));
  console.log(`📈 Total duration: ${totalDuration.toFixed(2)} seconds`);
  console.log(`🏁 Overall status: ${overallSuccess ? '✅ SUCCESS' : '⚠️  COMPLETED WITH ERRORS'}`);
  console.log('='.repeat(60));
  
  return { overallSuccess, results, totalDuration };
}

// Run the workflow if this script is executed directly
if (require.main === module) {
  runTestWorkflow().then(({ overallSuccess }) => {
    process.exit(overallSuccess ? 0 : 1);
  }).catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { runTestWorkflow, executeCommand };
