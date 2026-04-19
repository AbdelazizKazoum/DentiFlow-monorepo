import {Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {AUTH_PROTO_PATH} from "@lib/proto";

export const AUTH_GRPC_CLIENT = "AUTH_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_GRPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "auth",
            protoPath: AUTH_PROTO_PATH,
            url: config.get<string>("AUTH_SERVICE_GRPC_URL", "localhost:5001"),
            loader: { keepCase: true },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class AuthGrpcClientModule {}
