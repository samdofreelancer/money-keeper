module.exports = {
  default: [
    "--require-module ts-node/register",
    "--require src/domains/**/steps/**/*.ts",
    "--require src/hooks/**/*.ts",
    "--require src/support/**/*.ts",
    "--format @cucumber/pretty-formatter",
    "--format json:reports/cucumber-report.json",
    "--publish-quiet",
    "src/domains/**/features/**/*.feature",
  ].join(" "),
};
