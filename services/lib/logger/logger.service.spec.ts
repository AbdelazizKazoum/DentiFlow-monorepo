import {AppLogger} from "./logger.service";
import * as winston from "winston";

describe("AppLogger", () => {
  let logger: AppLogger;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new AppLogger();
    // Spy on the internal Winston logger's log method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logSpy = jest.spyOn((logger as any).logger, "log");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("logWithContext", () => {
    it("should call logger.log with clinicId in context", () => {
      const ctx = {clinicId: "clinic-1", userId: "user-2", traceId: "trace-3"};
      logger.logWithContext("info", "test message", ctx);

      expect(logSpy).toHaveBeenCalledWith("info", "test message", ctx);
    });

    it("should include all required observability fields when called", () => {
      const ctx = {
        clinicId: "clinic-abc",
        userId: "user-xyz",
        traceId: "trace-999",
      };
      logger.logWithContext("warn", "warning message", ctx);

      const [level, message, calledCtx] = logSpy.mock.calls[0];
      expect(level).toBe("warn");
      expect(message).toBe("warning message");
      expect(calledCtx).toMatchObject({
        clinicId: "clinic-abc",
        userId: "user-xyz",
        traceId: "trace-999",
      });
    });

    it("should support all valid log levels", () => {
      const levels: Array<"info" | "warn" | "error" | "debug"> = [
        "info",
        "warn",
        "error",
        "debug",
      ];
      const ctx = {clinicId: "c1", userId: "u1", traceId: "t1"};

      levels.forEach((level) => {
        logger.logWithContext(level, `${level} message`, ctx);
      });

      expect(logSpy).toHaveBeenCalledTimes(4);
    });

    it("should pass through extra context fields", () => {
      const ctx = {
        clinicId: "clinic-1",
        userId: "user-1",
        traceId: "trace-1",
        action: "patient.create",
        patientId: "p-123",
      };
      logger.logWithContext("info", "extra fields", ctx);

      const [, , calledCtx] = logSpy.mock.calls[0];
      expect(calledCtx).toMatchObject(ctx);
    });
  });

  describe("standard log methods", () => {
    it("log() should call winston info", () => {
      const infoSpy = jest.spyOn((logger as any).logger, "info");
      logger.log("a message", "SomeContext");
      expect(infoSpy).toHaveBeenCalledWith("a message", {
        context: "SomeContext",
      });
    });

    it("error() should call winston error", () => {
      const errorSpy = jest.spyOn((logger as any).logger, "error");
      logger.error("err message", "stack trace", "SomeContext");
      expect(errorSpy).toHaveBeenCalledWith("err message", {
        trace: "stack trace",
        context: "SomeContext",
      });
    });

    it("warn() should call winston warn", () => {
      const warnSpy = jest.spyOn((logger as any).logger, "warn");
      logger.warn("warn message", "SomeContext");
      expect(warnSpy).toHaveBeenCalledWith("warn message", {
        context: "SomeContext",
      });
    });
  });
});
