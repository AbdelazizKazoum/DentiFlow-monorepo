import {Module} from "@nestjs/common";
import {PatientGrpcClientModule} from "../../infrastructure/grpc/patient-grpc-client.module";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {PatientController} from "./controllers/patient.controller";
import {InsuranceProviderController} from "./controllers/insurance-provider.controller";
import {InsuranceTemplateController} from "./controllers/insurance-template.controller";
import {PatientInsuranceController} from "./controllers/patient-insurance.controller";
import {PatientDocumentController} from "./controllers/patient-document.controller";

@Module({
  imports: [PatientGrpcClientModule],
  controllers: [
    PatientController,
    InsuranceProviderController,
    InsuranceTemplateController,
    PatientInsuranceController,
    PatientDocumentController,
  ],
  providers: [RolesGuard, ClinicScopeGuard],
})
export class PatientModule {}
