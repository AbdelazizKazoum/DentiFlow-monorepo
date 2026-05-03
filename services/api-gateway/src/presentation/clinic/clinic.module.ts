import {Module} from "@nestjs/common";
import {ClinicController} from "./clinic.controller";
import {ClinicGrpcClientModule} from "../../infrastructure/grpc/clinic-grpc-client.module";

@Module({
  imports: [ClinicGrpcClientModule],
  controllers: [ClinicController],
})
export class ClinicModule {}
