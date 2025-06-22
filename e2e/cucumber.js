module.exports = {
  default: [
    "--require-module ts-node/register",
    "--require src/step_definitions/**/*.ts",
    "--require src/hooks/**/*.ts",
    "--require src/support/**/*.ts",
    "--format @cucumber/pretty-formatter",
    "--format json:reports/cucumber-report.json",
    "--publish-quiet",
    "--world-parameters '{\"stepTimeout\": 30000}'",
    "src/features/**/*.feature",
  ].join(" "),
};
