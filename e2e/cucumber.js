module.exports = {
  default: [
    "--require-module ts-node/register",
    "--require src/step_definitions/**/*.ts",
    "--require src/hooks/**/*.ts",
    "--require src/support/**/*.ts",
    "--format @cucumber/pretty-formatter",
    "--format json:reports/cucumber-report.json",
    "--publish-quiet",
    "src/features/**/*.feature",
  ].join(" "),
};
