import {Module} from "@nestjs/common";
import {PatientGrpcClientModule} from "../../infrastructure/grpc/patient-grpc-client.module";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {PatientController} from "./patient.controller";

@Module({
  imports: [PatientGrpcClientModule],
  controllers: [PatientController],
  providers: [RolesGuard, ClinicScopeGuard],
})
export class PatientModule {}
