import {Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {CLINIC_PROTO_PATH} from "@lib/proto";

export const CLINIC_GRPC_CLIENT = "CLINIC_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CLINIC_GRPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "clinic",
            protoPath: CLINIC_PROTO_PATH,
            url: config.get<string>(
              "CLINIC_SERVICE_GRPC_URL",
              "localhost:5002",
            ),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class ClinicGrpcClientModule {}
