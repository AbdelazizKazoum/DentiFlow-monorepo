import {validateEnv, NodeEnvironment} from "./env.validation";

const VALID_ENV: Record<string, unknown> = {
  NODE_ENV: "development",
  DB_HOST: "localhost",
  DB_PORT: "3306",
  DB_USERNAME: "root",
  DB_PASSWORD: "secret",
  DB_NAME: "dentiflow",
  JWT_SECRET: "supersecretkey",
};

describe("validateEnv", () => {
  describe("missing required variables", () => {
    it("should throw when DB_HOST is missing", () => {
      const config = {...VALID_ENV};
      delete config["DB_HOST"];

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });

    it("should throw when JWT_SECRET is missing", () => {
      const config = {...VALID_ENV};
      delete config["JWT_SECRET"];

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });

    it("should throw when DB_USERNAME is missing", () => {
      const config = {...VALID_ENV};
      delete config["DB_USERNAME"];

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });

    it("should throw when DB_PASSWORD is missing", () => {
      const config = {...VALID_ENV};
      delete config["DB_PASSWORD"];

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });

    it("should throw when DB_NAME is missing", () => {
      const config = {...VALID_ENV};
      delete config["DB_NAME"];

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });
  });

  describe("valid config resolves with defaults", () => {
    it("should return validated instance with correct values", () => {
      const result = validateEnv(VALID_ENV);

      expect(result.DB_HOST).toBe("localhost");
      expect(result.JWT_SECRET).toBe("supersecretkey");
    });

    it("should apply default for DB_PORT when not provided", () => {
      const config = {...VALID_ENV};
      delete config["DB_PORT"];

      const result = validateEnv(config);

      expect(result.DB_PORT).toBe(3306);
    });

    it("should apply default for JWT_EXPIRES_IN when not provided", () => {
      const config = {...VALID_ENV};
      delete config["JWT_EXPIRES_IN"];

      const result = validateEnv(config);

      expect(result.JWT_EXPIRES_IN).toBe(900);
    });

    it("should apply default for LOG_LEVEL when not provided", () => {
      const config = {...VALID_ENV};
      delete config["LOG_LEVEL"];

      const result = validateEnv(config);

      expect(result.LOG_LEVEL).toBe("info");
    });

    it("should apply default for PORT when not provided", () => {
      const config = {...VALID_ENV};
      delete config["PORT"];

      const result = validateEnv(config);

      expect(result.PORT).toBe(3000);
    });

    it("should apply default NODE_ENV of development when not provided", () => {
      const config = {...VALID_ENV};
      delete config["NODE_ENV"];

      const result = validateEnv(config);

      expect(result.NODE_ENV).toBe(NodeEnvironment.Development);
    });
  });

  describe("invalid values", () => {
    it("should throw when NODE_ENV is an invalid enum value", () => {
      const config = {...VALID_ENV, NODE_ENV: "staging"};

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });

    it("should throw when DB_PORT is out of range", () => {
      const config = {...VALID_ENV, DB_PORT: "99999"};

      expect(() => validateEnv(config)).toThrow(
        "Environment validation failed",
      );
    });
  });
});
