import {gatewaySchema, NodeEnvironment} from "./env.validation";

describe("gatewaySchema", () => {
  it("requires JWT_SECRET", () => {
    const {error} = gatewaySchema.validate({});
    expect(error).toBeDefined();
    expect(error!.message).toContain("JWT_SECRET");
  });

  it("rejects an empty JWT_SECRET", () => {
    const {error} = gatewaySchema.validate({JWT_SECRET: ""});
    expect(error).toBeDefined();
  });

  it("resolves with defaults when only JWT_SECRET is provided", () => {
    const {value, error} = gatewaySchema.validate({JWT_SECRET: "super-secret"});
    expect(error).toBeUndefined();
    expect(value.JWT_SECRET).toBe("super-secret");
    expect(value.PORT).toBe(3000);
    expect(value.NODE_ENV).toBe(NodeEnvironment.Development);
    expect(value.LOG_LEVEL).toBe("info");
    expect(value.JWT_EXPIRES_IN).toBe(900);
    expect(value.AUTH_SERVICE_URL).toBe("http://auth-service:3001");
    expect(value.CLINIC_SERVICE_URL).toBe("http://clinic-service:3002");
  });

  it("does NOT require DB vars", () => {
    const {error} = gatewaySchema.validate({JWT_SECRET: "secret"});
    expect(error).toBeUndefined();
  });

  it("accepts and coerces a full valid configuration", () => {
    const {value, error} = gatewaySchema.validate({
      JWT_SECRET: "my-secret",
      PORT: "4000",
      NODE_ENV: "production",
      LOG_LEVEL: "debug",
      JWT_EXPIRES_IN: "1800",
      AUTH_SERVICE_URL: "http://auth:3001",
      CLINIC_SERVICE_URL: "http://clinic:3002",
    });
    expect(error).toBeUndefined();
    expect(value.PORT).toBe(4000);
    expect(value.NODE_ENV).toBe(NodeEnvironment.Production);
    expect(value.LOG_LEVEL).toBe("debug");
    expect(value.JWT_EXPIRES_IN).toBe(1800);
  });
});
