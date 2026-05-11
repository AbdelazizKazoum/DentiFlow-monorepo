import "reflect-metadata";
import {NestFactory} from "@nestjs/core";
import {ValidationPipe} from "@nestjs/common";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ConfigService} from "@nestjs/config";
import {APPOINTMENT_PROTO_PATH} from "@lib/proto";
import {AppLogger, CorrelationInterceptor} from "../../lib";
import {AppModule} from "./app.module";

async function bootstrap() {
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection (suppressed):", reason);
  });

  const app = await NestFactory.create(AppModule, {bufferLogs: true});

  app.useLogger(app.get(AppLogger));
  app.useGlobalInterceptors(app.get(CorrelationInterceptor));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix("api/v1", {exclude: ["/health"]});

  const swaggerConfig = new DocumentBuilder()
    .setTitle("DentiFlow Appointment Service")
    .setDescription("Appointments and waiting-room queue service")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT", 3005);
  const grpcPort = config.get<number>("GRPC_PORT", 5004);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: "appointment",
      protoPath: APPOINTMENT_PROTO_PATH,
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);

  app
    .get(AppLogger)
    .log(
      `Appointment Service running on port ${port}, gRPC on port ${grpcPort}`,
      "Bootstrap",
    );
}

bootstrap().catch((err: unknown) => {
  console.error("Fatal startup error", err);
  process.exit(1);
});
