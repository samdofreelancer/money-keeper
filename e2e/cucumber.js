module.exports = {
  default: `--require-module ts-node/register --require support/hooks.ts --require support/world.ts --require steps/**/*.ts --format @cucumber/pretty-formatter --format json:reports/cucumber-report.json --publish-quiet`,
};
