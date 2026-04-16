import {Injectable, LoggerService, Optional, Scope} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import pino, {Logger} from "pino";

export interface LogContext {
  clinicId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

/**
 * AppLogger — structured logger backed by pino.
 *
 * - development/staging: colorized output via pino-pretty
 * - production:          raw JSON (fast, pipe to log aggregator)
 * - test:               silent (no output, all methods spyable)
 *
 * Replace the default Nest logger in each service main.ts:
 *   app.useLogger(app.get(AppLogger));
 *
 * For structured business-logic logs use logWithContext():
 *   logger.logWithContext('info', 'patient created', { clinicId, userId, traceId });
 */
@Injectable({scope: Scope.DEFAULT})
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const nodeEnv =
      configService?.get<string>("NODE_ENV") ?? process.env["NODE_ENV"];
    const level =
      configService?.get<string>("LOG_LEVEL") ??
      process.env["LOG_LEVEL"] ??
      "info";

    const isProduction = nodeEnv === "production";
    const isTest = nodeEnv === "test";

    this.logger = pino(
      {level: isTest ? "silent" : level},
      isProduction || isTest
        ? undefined
        : (pino.transport({
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:HH:MM:ss.l",
              ignore: "pid,hostname",
              singleLine: false,
              levelFirst: true,
            },
          }) as unknown as import("pino").DestinationStream),
    );
  }

  log(message: string, context?: string): void {
    this.logger.info({context}, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({trace, context}, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({context}, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({context}, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({context}, message);
  }

  logWithContext(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    ctx: LogContext,
  ): void {
    this.logger[level](ctx, message);
  }
}
