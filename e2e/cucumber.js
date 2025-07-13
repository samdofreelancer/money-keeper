module.exports = {
  default: [
    "--require-module ts-node/register",
    "--require src/domains/**/presentation/steps/**/*.ts",
    "--require src/shared/presentation/steps/*.ts",
    "--require src/shared/infrastructure/hooks/**/*.ts",
    "--require src/support/**/*.ts",
    "--format @cucumber/pretty-formatter",
    "--format json:reports/cucumber-report.json",
    "--publish-quiet",
    "src/domains/**/presentation/features/**/*.feature",
  ].join(" "),
};
