import {Global, Module} from "@nestjs/common";
import {AppLogger} from "./logger.service";
import {CorrelationInterceptor} from "./correlation.interceptor";

/**
 * LoggerModule — global module: AppLogger and CorrelationInterceptor
 * are injectable everywhere without re-importing.
 */
@Global()
@Module({
  providers: [AppLogger, CorrelationInterceptor],
  exports: [AppLogger, CorrelationInterceptor],
})
export class LoggerModule {}
