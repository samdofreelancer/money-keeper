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
const scenariosToRun = [];

for (const line of lines) {
  if (line) {
    const featureIdentifier = '.feature';
    const featureIndex = line.indexOf(featureIdentifier);
    
    if (featureIndex !== -1) {
      const pathEndIndex = featureIndex + featureIdentifier.length;
      const filePath = line.substring(0, pathEndIndex);
      const lineNumbersStr = line.substring(pathEndIndex + 1);
      const lineNumbers = lineNumbersStr.split(':').filter(ln => ln);

      for (const lineNumber of lineNumbers) {
        // Add quotes around the path to handle potential spaces
        scenariosToRun.push(`"${filePath}:${lineNumber}"`);
      }
    } else {
      scenariosToRun.push(`"${line}"`); // Fallback for lines without .feature
    }
  }
}

if (scenariosToRun.length > 0) {
    console.log(`Found ${scenariosToRun.length} scenarios to rerun.`);
    const scenariosCommandString = scenariosToRun.join(' ');
    
    console.log(`\n▶️  Running ${scenariosToRun.length} scenarios in a single command...`);
    try {
        execSync(`npx cucumber-js ${scenariosCommandString} ${process.argv.slice(2).join(' ')}`, { stdio: 'inherit' });
        console.log('\n✅ Rerun complete.');
    } catch (error) {
        console.error(`❌ Rerun command failed.`);
        process.exit(1);
    }
} else {
    console.log('✅ No scenarios found to rerun.');
}
