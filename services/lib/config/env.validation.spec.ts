import {
  databaseSchema,
  jwtSchema,
  baseSchema,
  NodeEnvironment,
} from "./env.validation";

const VALID_DB_ENV = {
  NODE_ENV: "development",
  DB_HOST: "localhost",
  DB_PORT: "3306",
  DB_USERNAME: "root",
  DB_PASSWORD: "secret",
  DB_NAME: "dentiflow",
  JWT_SECRET: "supersecretkey",
};

describe("baseSchema", () => {
  it("applies defaults when nothing is provided", () => {
    const {value, error} = baseSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.NODE_ENV).toBe(NodeEnvironment.Development);
    expect(value.LOG_LEVEL).toBe("info");
    expect(value.PORT).toBe(3000);
  });

  it("rejects an invalid NODE_ENV", () => {
    const {error} = baseSchema.validate({NODE_ENV: "staging"});
    expect(error).toBeDefined();
  });
});

describe("jwtSchema", () => {
  it("requires JWT_SECRET", () => {
    const {error} = jwtSchema.validate({});
    expect(error).toBeDefined();
    expect(error!.message).toContain("JWT_SECRET");
  });

  it("applies default JWT_EXPIRES_IN of 900", () => {
    const {value, error} = jwtSchema.validate({JWT_SECRET: "secret"});
    expect(error).toBeUndefined();
    expect(value.JWT_EXPIRES_IN).toBe(900);
  });

  it("does NOT require DB vars", () => {
    const {error} = jwtSchema.validate({JWT_SECRET: "secret"});
    expect(error).toBeUndefined();
  });
});

describe("databaseSchema", () => {
  describe("missing required variables", () => {
    it.each(["DB_HOST", "DB_USERNAME", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"])(
      "throws when %s is missing",
      (key) => {
        const config = {...VALID_DB_ENV, [key]: undefined};
        const {error} = databaseSchema.validate(config);
        expect(error).toBeDefined();
      },
    );
  });

  describe("defaults", () => {
    it("applies default DB_PORT of 3306", () => {
      const config = {...VALID_DB_ENV};
      delete (config as Record<string, unknown>)["DB_PORT"];
      const {value, error} = databaseSchema.validate(config);
      expect(error).toBeUndefined();
      expect(value.DB_PORT).toBe(3306);
    });

    it("applies default JWT_EXPIRES_IN of 900", () => {
      const {value} = databaseSchema.validate(VALID_DB_ENV);
      expect(value.JWT_EXPIRES_IN).toBe(900);
    });

    it("applies default LOG_LEVEL of info", () => {
      const {value} = databaseSchema.validate(VALID_DB_ENV);
      expect(value.LOG_LEVEL).toBe("info");
    });

    it("applies default PORT of 3000", () => {
      const {value} = databaseSchema.validate(VALID_DB_ENV);
      expect(value.PORT).toBe(3000);
    });

    it("applies default NODE_ENV of development", () => {
      const {value} = databaseSchema.validate(VALID_DB_ENV);
      expect(value.NODE_ENV).toBe(NodeEnvironment.Development);
    });
  });

  describe("valid full config", () => {
    it("returns validated values", () => {
      const {value, error} = databaseSchema.validate(VALID_DB_ENV);
      expect(error).toBeUndefined();
      expect(value.DB_HOST).toBe("localhost");
      expect(value.JWT_SECRET).toBe("supersecretkey");
    });
  });

  describe("invalid values", () => {
    it("rejects invalid NODE_ENV", () => {
      const {error} = databaseSchema.validate({
        ...VALID_DB_ENV,
        NODE_ENV: "staging",
      });
      expect(error).toBeDefined();
    });

    it("rejects DB_PORT out of valid range", () => {
      const {error} = databaseSchema.validate({
        ...VALID_DB_ENV,
        DB_PORT: "99999",
      });
      expect(error).toBeDefined();
    });
  });
});
