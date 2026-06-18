import {Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {TREATMENT_PROTO_PATH} from "@lib/proto";

export const TREATMENT_GRPC_CLIENT = "TREATMENT_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: TREATMENT_GRPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "treatment",
            protoPath: TREATMENT_PROTO_PATH,
            url: config.get<string>("TREATMENT_SERVICE_GRPC_URL", "localhost:5005"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class TreatmentGrpcClientModule {}
