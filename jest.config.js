module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns : [__dirname + "/node_modules/", "/dist", "/coverage"]
};