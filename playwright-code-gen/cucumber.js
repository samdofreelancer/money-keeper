module.exports = {
  default: {
    format: ['progress'],
    requireModule: ['ts-node/register'],
    require: [
      'src/**/*.ts',
      'src/**/*.js'
    ],
    worldParameters: {
      // Add any world parameters here if needed
    }
  }
};
