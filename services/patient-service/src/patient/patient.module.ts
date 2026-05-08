import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PatientGrpcController} from "../presentation/grpc/controllers/patient.grpc-controller";
import {InsuranceProviderGrpcController} from "../presentation/grpc/controllers/insurance-provider.grpc-controller";
import {InsuranceTemplateGrpcController} from "../presentation/grpc/controllers/insurance-template.grpc-controller";
import {PatientInsuranceGrpcController} from "../presentation/grpc/controllers/patient-insurance.grpc-controller";
import {PatientDocumentGrpcController} from "../presentation/grpc/controllers/patient-document.grpc-controller";
import {ManagePatientsUseCase} from "../application/use-cases/manage-patients.use-case";
import {ManageInsuranceProvidersUseCase} from "../application/use-cases/manage-insurance-providers.use-case";
import {ManageInsuranceTemplatesUseCase} from "../application/use-cases/manage-insurance-templates.use-case";
import {ManagePatientInsurancesUseCase} from "../application/use-cases/manage-patient-insurances.use-case";
import {ManagePatientDocumentsUseCase} from "../application/use-cases/manage-patient-documents.use-case";
import {PatientTypeOrmEntity} from "../infrastructure/persistence/entities/patient.typeorm-entity";
import {InsuranceProviderTypeOrmEntity} from "../infrastructure/persistence/entities/insurance-provider.typeorm-entity";
import {InsuranceTemplateTypeOrmEntity} from "../infrastructure/persistence/entities/insurance-template.typeorm-entity";
import {PatientInsuranceTypeOrmEntity} from "../infrastructure/persistence/entities/patient-insurance.typeorm-entity";
import {PatientDocumentTypeOrmEntity} from "../infrastructure/persistence/entities/patient-document.typeorm-entity";
import {PatientRepository} from "../infrastructure/persistence/repositories/patient.repository";
import {InsuranceProviderRepository} from "../infrastructure/persistence/repositories/insurance-provider.repository";
import {InsuranceTemplateRepository} from "../infrastructure/persistence/repositories/insurance-template.repository";
import {PatientInsuranceRepository} from "../infrastructure/persistence/repositories/patient-insurance.repository";
import {PatientDocumentRepository} from "../infrastructure/persistence/repositories/patient-document.repository";
import {
  INSURANCE_PROVIDER_REPOSITORY,
  INSURANCE_TEMPLATE_REPOSITORY,
  PATIENT_DOCUMENT_REPOSITORY,
  PATIENT_INSURANCE_REPOSITORY,
  PATIENT_REPOSITORY,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientTypeOrmEntity,
      InsuranceProviderTypeOrmEntity,
      InsuranceTemplateTypeOrmEntity,
      PatientInsuranceTypeOrmEntity,
      PatientDocumentTypeOrmEntity,
    ]),
  ],
  controllers: [
    PatientGrpcController,
    InsuranceProviderGrpcController,
    InsuranceTemplateGrpcController,
    PatientInsuranceGrpcController,
    PatientDocumentGrpcController,
  ],
  providers: [
    ManagePatientsUseCase,
    ManageInsuranceProvidersUseCase,
    ManageInsuranceTemplatesUseCase,
    ManagePatientInsurancesUseCase,
    ManagePatientDocumentsUseCase,
    {provide: PATIENT_REPOSITORY, useClass: PatientRepository},
    {
      provide: INSURANCE_PROVIDER_REPOSITORY,
      useClass: InsuranceProviderRepository,
    },
    {
      provide: INSURANCE_TEMPLATE_REPOSITORY,
      useClass: InsuranceTemplateRepository,
    },
    {
      provide: PATIENT_INSURANCE_REPOSITORY,
      useClass: PatientInsuranceRepository,
    },
    {provide: PATIENT_DOCUMENT_REPOSITORY, useClass: PatientDocumentRepository},
  ],
})
export class PatientModule {}
