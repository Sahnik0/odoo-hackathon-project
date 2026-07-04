import nextJest from 'next/jest.js';

// next/jest wires up SWC transform (TS/JSX), path aliases from tsconfig, and
// CSS/asset mocks — so plain `jest` runs the TS test suite with no extra babel.
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ignore build output so jest-haste-map doesn't collide on package.json.
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};

export default createJestConfig(config);
