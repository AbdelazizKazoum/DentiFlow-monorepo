import {Injectable, LoggerService, Scope} from "@nestjs/common";
import * as winston from "winston";

export interface LogContext {
  clinicId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

/**
 * AppLogger — structured JSON logger backed by Winston.
 *
 * Replaces the default Nest logger in each service main.ts:
 *   app.useLogger(app.get(AppLogger));
 *
 * Always call logWithContext() with { clinicId, userId, traceId }
 * for data-access and business-logic logs.
 */
@Injectable({scope: Scope.DEFAULT})
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env["LOG_LEVEL"] ?? "info",
      format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DDTHH:mm:ss.SSSZ"}),
        winston.format.errors({stack: true}),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, {context});
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, {trace, context});
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, {context});
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, {context});
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, {context});
  }

  logWithContext(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    ctx: LogContext,
  ): void {
    this.logger.log(level, message, ctx);
  }
}
