import {Module} from "@nestjs/common";
import {PatientGrpcClientModule} from "../../infrastructure/grpc/patient-grpc-client.module";
import {TreatmentGrpcClientModule} from "../../infrastructure/grpc/treatment-grpc-client.module";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {TreatmentController} from "./treatment.controller";

@Module({
  imports: [TreatmentGrpcClientModule, PatientGrpcClientModule],
  controllers: [TreatmentController],
  providers: [RolesGuard, ClinicScopeGuard],
})
export class TreatmentModule {}
