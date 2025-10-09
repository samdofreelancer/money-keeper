const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rerunFile = path.join(__dirname, '..', 'test-results', 'rerun.txt');
if (!fs.existsSync(rerunFile)) {
  console.log('✅ rerun.txt not found, no tests to rerun.');
  process.exit(0);
}

const content = fs.readFileSync(rerunFile, 'utf8').trim();
if (content === '') {
  console.log('✅ rerun.txt is empty, no tests to rerun.');
  process.exit(0);
}

const lines = content.split(/\r?\n/);

console.log(`Found ${lines.length} scenarios to rerun.`);

for (const line of lines) {
  if (line) {
    console.log(`\n▶️  Running: ${line}`);
    try {
      // Execute cucumber-js for each specific scenario
      // Pass additional arguments from the command line to cucumber-js
      execSync(`npx cucumber-js \"${line}\" ${process.argv.slice(2).join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`❌ Scenario failed: ${line}`);
      // We don't exit here, to allow other scenarios to run.
      // A non-zero exit code will be returned by the calling process eventually.
    }
  }
}

console.log('\n✅ Rerun complete.');
