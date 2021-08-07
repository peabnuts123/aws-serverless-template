// See jest docs for config options: https://jestjs.io/docs/en/configuration
module.exports = {
  preset: "ts-jest",
  globals: {
    'ts-jest': {
      'tsconfig': '<rootDir>/test/tsconfig.json',
    },
  },
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  testURL: "http://localhost:8080",
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/fail-on-no-assertion.ts',
    '<rootDir>/test/setup/configure-logger.ts',
  ],
  testRegex: [
    "test/.*\\.test.[jt]s$",
  ],
  moduleNameMapper: {
    "^/(.*)$": "<rootDir>/$1", // parcel module resolutions // @TODO update
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,ts}',
  ],
};
