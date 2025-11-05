module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  collectCoverageFrom: [
    'src/renderer/js/**/*.js',
    '!src/renderer/vendor/**'
  ],
  coverageDirectory: 'coverage/unit',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js']
};
