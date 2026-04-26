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

  const configService = app.get(ConfigService);
  const frontendUrl =
    configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000";

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));

  // /health and /events/queue are outside the versioned API prefix
  app.setGlobalPrefix("api/v1", {
    exclude: ["/health", "/events/queue"],
  });

  const port = configService.get<number>("PORT", 3000);

  await app.listen(port);
  app.get(AppLogger).log(`API Gateway running on port ${port}`, "Bootstrap");
}

bootstrap().catch((err: unknown) => {
  console.error("Fatal startup error", err);
  process.exit(1);
});
