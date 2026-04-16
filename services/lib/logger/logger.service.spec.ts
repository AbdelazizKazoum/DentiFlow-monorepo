import {AppLogger} from "./logger.service";

// NODE_ENV=test is set by Jest → pino uses level:'silent' + no transport.
// All log methods still exist and are spyable — they just discard output.

describe("AppLogger", () => {
  let logger: AppLogger;

  beforeEach(() => {
    logger = new AppLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("logWithContext", () => {
    it("should call pino info with merged context object", () => {
      const spy = jest.spyOn((logger as any).logger, "info");
      const ctx = {clinicId: "clinic-1", userId: "user-2", traceId: "trace-3"};
      logger.logWithContext("info", "test message", ctx);

      expect(spy).toHaveBeenCalledWith(ctx, "test message");
    });

    it("should include all required observability fields", () => {
      const spy = jest.spyOn((logger as any).logger, "warn");
      const ctx = {
        clinicId: "clinic-abc",
        userId: "user-xyz",
        traceId: "trace-999",
      };
      logger.logWithContext("warn", "warning message", ctx);

      expect(spy).toHaveBeenCalledWith(ctx, "warning message");
    });

    it("should support all valid log levels", () => {
      const spies = {
        info: jest.spyOn((logger as any).logger, "info"),
        warn: jest.spyOn((logger as any).logger, "warn"),
        error: jest.spyOn((logger as any).logger, "error"),
        debug: jest.spyOn((logger as any).logger, "debug"),
      };
      const ctx = {clinicId: "c1", userId: "u1", traceId: "t1"};

      (["info", "warn", "error", "debug"] as const).forEach((level) => {
        logger.logWithContext(level, `${level} message`, ctx);
      });

      Object.values(spies).forEach((spy) =>
        expect(spy).toHaveBeenCalledTimes(1),
      );
    });

    it("should pass through extra context fields", () => {
      const spy = jest.spyOn((logger as any).logger, "info");
      const ctx = {
        clinicId: "clinic-1",
        userId: "user-1",
        traceId: "trace-1",
        action: "patient.create",
        patientId: "p-123",
      };
      logger.logWithContext("info", "extra fields", ctx);

      expect(spy).toHaveBeenCalledWith(ctx, "extra fields");
    });
  });

  describe("standard NestJS LoggerService methods", () => {
    it("log() should call pino info with context field", () => {
      const spy = jest.spyOn((logger as any).logger, "info");
      logger.log("a message", "SomeContext");

      expect(spy).toHaveBeenCalledWith({context: "SomeContext"}, "a message");
    });

    it("error() should call pino error with trace and context fields", () => {
      const spy = jest.spyOn((logger as any).logger, "error");
      logger.error("err message", "stack trace", "SomeContext");

      expect(spy).toHaveBeenCalledWith(
        {trace: "stack trace", context: "SomeContext"},
        "err message",
      );
    });

    it("warn() should call pino warn with context field", () => {
      const spy = jest.spyOn((logger as any).logger, "warn");
      logger.warn("warn message", "SomeContext");

      expect(spy).toHaveBeenCalledWith(
        {context: "SomeContext"},
        "warn message",
      );
    });
  });
});
