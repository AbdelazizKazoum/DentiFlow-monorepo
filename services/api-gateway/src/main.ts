import "reflect-metadata";
import {NestFactory} from "@nestjs/core";
import {ValidationPipe} from "@nestjs/common";
import cookieParser from "cookie-parser";
import {AppModule} from "./app.module";
import {AppLogger, CorrelationInterceptor} from "../../lib";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});

  app.useLogger(app.get(AppLogger));
  app.useGlobalInterceptors(app.get(CorrelationInterceptor));

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));

  // /health and /events/queue are outside the versioned API prefix
  app.setGlobalPrefix("api/v1", {
    exclude: ["/health", "/events/queue"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);

  await app.listen(port);
  app.get(AppLogger).log(`API Gateway running on port ${port}`, "Bootstrap");
}

bootstrap().catch((err: unknown) => {
  console.error("Fatal startup error", err);
  process.exit(1);
});
