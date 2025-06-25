const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const reportsDir = path.resolve(__dirname, '../target/small-test-reports');
const outputFile = path.resolve(reportsDir, 'overview-report.json');

async function parseXmlFile(filePath) {
  const xml = await fs.promises.readFile(filePath, 'utf-8');
  return xml2js.parseStringPromise(xml);
}

async function aggregateReports() {
  try {
    const files = await fs.promises.readdir(reportsDir);
    const xmlFiles = files.filter(f => f.endsWith('.xml'));

    let totalTests = 0;
    let totalFailures = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    for (const file of xmlFiles) {
      const filePath = path.join(reportsDir, file);
      const result = await parseXmlFile(filePath);

      // Surefire XML root is <testsuite>
      const testsuite = result.testsuite;
      if (testsuite) {
        totalTests += parseInt(testsuite.$.tests || 0, 10);
        totalFailures += parseInt(testsuite.$.failures || 0, 10);
        totalErrors += parseInt(testsuite.$.errors || 0, 10);
        totalSkipped += parseInt(testsuite.$.skipped || 0, 10);
      }
    }

    const totalPassed = totalTests - totalFailures - totalErrors - totalSkipped;

    const overview = {
      totalTests,
      totalPassed,
      totalFailures,
      totalErrors,
      totalSkipped,
    };

    await fs.promises.writeFile(outputFile, JSON.stringify(overview, null, 2), 'utf-8');
    console.log('Overview report generated at:', outputFile);
  } catch (err) {
    console.error('Error aggregating test reports:', err);
    process.exit(1);
  }
}

aggregateReports();
