import {Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {PATIENT_PROTO_PATH} from "@lib/proto";

export const PATIENT_GRPC_CLIENT = "PATIENT_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PATIENT_GRPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "patient",
            protoPath: PATIENT_PROTO_PATH,
            url: config.get<string>(
              "PATIENT_SERVICE_GRPC_URL",
              "localhost:5003",
            ),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class PatientGrpcClientModule {}
