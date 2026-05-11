import type {Config} from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/src"],
  testRegex: ".*\\.spec\\.ts$",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", {tsconfig: "<rootDir>/tsconfig.test.json"}],
  },
  moduleNameMapper: {
    "^@lib$": "<rootDir>/../lib/index",
    "^@lib/(.*)$": "<rootDir>/../lib/$1",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
};

export default config;
