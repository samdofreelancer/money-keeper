const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function run() {
  try {
    const reportPath = core.getInput('report-path');
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const context = github.context;

    const files = fs.readdirSync(reportPath).filter(f => f.endsWith('.xml'));
    let totalTests = 0;
    let totalFailures = 0;
    let totalSkipped = 0;

    for (const file of files) {
      const xml = fs.readFileSync(path.join(reportPath, file), 'utf-8');
      const result = await xml2js.parseStringPromise(xml);
      const testsuite = result.testsuite;
      if (testsuite) {
        totalTests += parseInt(testsuite.$.tests || '0');
        totalFailures += parseInt(testsuite.$.failures || '0');
        totalSkipped += parseInt(testsuite.$.skipped || '0');
      }
    }

    const conclusion = totalFailures > 0 ? 'failure' : 'success';

    await octokit.rest.checks.create({
      ...context.repo,
      name: 'Surefire Test Report',
      head_sha: context.sha,
      status: 'completed',
      conclusion: conclusion,
      output: {
        title: 'Surefire Test Report',
        summary: `Total tests: ${totalTests}\nFailures: ${totalFailures}\nSkipped: ${totalSkipped}`
      }
    });

    core.info(`Test report published: Total tests: ${totalTests}, Failures: ${totalFailures}, Skipped: ${totalSkipped}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
