module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testTimeout: 10000,
  "transform": {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest"
  }
};