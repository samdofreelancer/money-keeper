#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skipClean: args.includes('--skip-clean'),
    skipReport: args.includes('--skip-report'),
    skipOpen: args.includes('--skip-open'),
    fastMode: args.includes('--fast'),
    workers: 4 // Default to 4 workers for parallel execution
  };

  // Extract workers count if specified
  const workersIndex = args.findIndex(arg => arg.startsWith('--workers='));
  if (workersIndex !== -1) {
    options.workers = parseInt(args[workersIndex].split('=')[1]) || 4;
  }

  return options;
}

// Function to execute a command and measure its execution time
function executeCommand(command, description, envVars = {}) {
  console.log(`\n🚀 ${description}`);
  console.log(`📝 Command: ${command}`);
  
  const startTime = Date.now();
  
  try {
    const result = execSync(command, { 
      stdio: 'inherit',
      cwd: path.dirname(__dirname), // Run from the playwright-code-gen directory
      env: { ...process.env, ...envVars }
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
  const options = parseArgs();
  
  console.log('='.repeat(60));
  console.log('🧪 STARTING OPTIMIZED TEST WORKFLOW');
  console.log('='.repeat(60));
  console.log('⚡ Optimization Flags:');
  console.log(`   • Skip Clean: ${options.skipClean}`);
  console.log(`   • Skip Report Generation: ${options.skipReport}`);
  console.log(`   • Skip Report Opening: ${options.skipOpen}`);
  console.log(`   • Fast Mode: ${options.fastMode}`);
  console.log(`   • Workers: ${options.workers}`);
  console.log('='.repeat(60));
  
  const results = [];
  let overallSuccess = true;
  
  // 1. Clean allure results (optional)
  if (!options.skipClean) {
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
  } else {
    console.log('\n⏭️  Skipping allure cleanup');
    results.push({ success: true, duration: 0 });
  }
  
  // 2. Run tests with optimization flags
  const testEnvVars = {
    CUCUMBER_PARALLEL_WORKERS: options.workers.toString(),
    CAPTURE_ALL_SCREENSHOTS: options.fastMode ? 'false' : 'true'
  };
  
  const testResult = executeCommand(
    'npm run test',
    'Running Cucumber tests with optimizations',
    testEnvVars
  );
  results.push(testResult);
  
  if (!testResult.success) {
    overallSuccess = false;
    console.log('⚠️  Tests failed, but continuing with report generation');
    // Continue even if tests fail to generate the report
  }
  
  // 3. Generate Allure report (optional)
  if (!options.skipReport) {
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
  } else {
    console.log('\n⏭️  Skipping report generation');
    results.push({ success: true, duration: 0 });
  }
  
  // 4. Open Allure report (optional)
  if (!options.skipOpen) {
    const reportResult = executeCommand(
      'npm run allure:report',
      'Opening Allure report in browser'
    );
    results.push(reportResult);
    
    if (!reportResult.success) {
      overallSuccess = false;
      console.log('⚠️  Could not open report in browser, but report was generated');
    }
  } else {
    console.log('\n⏭️  Skipping report opening');
    results.push({ success: true, duration: 0 });
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZED TEST WORKFLOW SUMMARY');
  console.log('='.repeat(60));
  
  const steps = [
    'Clean Allure results',
    'Run Cucumber tests',
    'Generate Allure report', 
    'Open Allure report'
  ];
  
  let totalDuration = 0;
  let testExecutionTime = 0;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    const stepName = steps[index];
    console.log(`${stepName}: ${status} (${result.duration.toFixed(2)}s)`);
    totalDuration += result.duration;
    
    // Track test execution time separately
    if (index === 1) {
      testExecutionTime = result.duration;
    }
  });
  
  console.log('─'.repeat(40));
  console.log(`📈 Total duration: ${totalDuration.toFixed(2)} seconds`);
  console.log(`⚡ Test execution only: ${testExecutionTime.toFixed(2)} seconds`);
  console.log(`🏁 Overall status: ${overallSuccess ? '✅ SUCCESS' : '⚠️  COMPLETED WITH ERRORS'}`);
  
  // Performance improvement metrics
  if (testExecutionTime > 0) {
    const improvement = ((8.338 - testExecutionTime) / 8.338 * 100).toFixed(1);
    console.log(`📊 Performance improvement: ${improvement}% faster test execution`);
  }
  
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
