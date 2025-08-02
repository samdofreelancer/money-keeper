module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    require: ['src/domains/**/steps/*.ts', 'src/shared/utilities/hooks.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:test-results/cucumber-report.html'],
    parallel: parseInt(process.env.CUCUMBER_PARALLEL_WORKERS || '2')
  }
};
