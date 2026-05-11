import {Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {APPOINTMENT_PROTO_PATH} from "@lib/proto";

export const APPOINTMENT_GRPC_CLIENT = "APPOINTMENT_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: APPOINTMENT_GRPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "appointment",
            protoPath: APPOINTMENT_PROTO_PATH,
            url: config.get<string>(
              "APPOINTMENT_SERVICE_GRPC_URL",
              "localhost:5004",
            ),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class AppointmentGrpcClientModule {}
