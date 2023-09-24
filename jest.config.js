module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    moduleNameMapper: {
      '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    },
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
  };
  