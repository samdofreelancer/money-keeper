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
const runnableLocations = new Set();

for (const line of lines) {
  if (!line) continue;

  const parts = line.split(':');
  if (parts.length < 2) {
    runnableLocations.add(`"${line}"`);
    continue;
  }

  const filePath = parts[0];
  const lineNumbers = parts.slice(1).map(n => parseInt(n, 10));

  if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: Feature file not found at ${filePath}. Skipping.`);
      continue;
  }

  const featureFileContent = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const lineNumber of lineNumbers) {
    const lineIndex = lineNumber - 1;
    if (lineIndex < 0 || lineIndex >= featureFileContent.length) continue;

    const lineContent = featureFileContent[lineIndex].trim();

    if (lineContent.startsWith('|')) {
      // It's likely an Examples row, find the parent Scenario Outline
      let foundOutline = false;
      for (let i = lineIndex - 1; i >= 0; i--) {
        const parentLine = featureFileContent[i].trim();
        if (parentLine.startsWith('Scenario Outline:')) {
          const outlineLineNumber = i + 1;
          runnableLocations.add(`"${filePath}:${outlineLineNumber}"`);
          foundOutline = true;
          break;
        }
      }
      if (!foundOutline) {
        // Fallback: couldn't find outline, add the file itself
        runnableLocations.add(`"${filePath}"`);
      }
    } else {
      // Assume it's a regular scenario line, which is runnable
      runnableLocations.add(`"${filePath}:${lineNumber}"`);
    }
  }
}


if (runnableLocations.size > 0) {
    const commandString = Array.from(runnableLocations).join(' ');
    console.log(`\n▶️  Rerunning ${runnableLocations.size} failed scenarios/outlines...`);
    console.log(commandString);
    try {
        execSync(`npx cucumber-js ${commandString} ${process.argv.slice(2).join(' ')}`, { stdio: 'inherit' });
        console.log('\n✅ Rerun complete.');
    } catch (error) {
        console.error(`❌ Rerun command failed.`);
        process.exit(1);
    }
} else {
    console.log('✅ No scenarios found to rerun.');
}
