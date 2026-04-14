import type {Config} from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/lib"],
  testRegex: ".*\\.spec\\.ts$",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
  collectCoverageFrom: ["lib/**/*.(t|j)s"],
  coverageDirectory: "../coverage/services",
  testEnvironment: "node",
};

export default config;
