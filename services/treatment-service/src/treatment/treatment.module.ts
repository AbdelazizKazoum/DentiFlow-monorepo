import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ManageTreatmentWorkspaceUseCase} from "../application/use-cases/manage-treatment-workspace.use-case";
import {ManageVisitWorkflowUseCase} from "../application/use-cases/manage-visit-workflow.use-case";
import {OutboxRelayService} from "../infrastructure/nats/outbox-relay.service";
import {
  ClinicalAttachmentTypeOrmEntity,
  DiagnosisTypeOrmEntity,
  FollowUpRequestTypeOrmEntity,
  MedicalDocumentRequestTypeOrmEntity,
  OutboxTypeOrmEntity,
  TreatmentActTypeOrmEntity,
  TreatmentChargeTypeOrmEntity,
  TreatmentGroupTypeOrmEntity,
  TreatmentPlanItemTypeOrmEntity,
  VisitHandoffTypeOrmEntity,
  VisitProcedureTypeOrmEntity,
  VisitTypeOrmEntity,
} from "../infrastructure/persistence/entities/treatment.typeorm-entities";
import {OutboxRepository} from "../infrastructure/persistence/repositories/outbox.repository";
import {TreatmentRepository} from "../infrastructure/persistence/repositories/treatment.repository";
import {VisitWorkflowRepository} from "../infrastructure/persistence/repositories/visit-workflow.repository";
import {TreatmentGrpcController} from "../presentation/grpc/treatment.grpc-controller";
import {
  OUTBOX_REPOSITORY,
  TREATMENT_REPOSITORY,
  VISIT_WORKFLOW_REPOSITORY,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreatmentActTypeOrmEntity,
      VisitTypeOrmEntity,
      TreatmentGroupTypeOrmEntity,
      TreatmentPlanItemTypeOrmEntity,
      VisitProcedureTypeOrmEntity,
      DiagnosisTypeOrmEntity,
      ClinicalAttachmentTypeOrmEntity,
      VisitHandoffTypeOrmEntity,
      TreatmentChargeTypeOrmEntity,
      FollowUpRequestTypeOrmEntity,
      MedicalDocumentRequestTypeOrmEntity,
      OutboxTypeOrmEntity,
    ]),
  ],
  controllers: [TreatmentGrpcController],
  providers: [
    ManageVisitWorkflowUseCase,
    ManageTreatmentWorkspaceUseCase,
    OutboxRelayService,
    {provide: VISIT_WORKFLOW_REPOSITORY, useClass: VisitWorkflowRepository},
    {provide: TREATMENT_REPOSITORY, useClass: TreatmentRepository},
    {provide: OUTBOX_REPOSITORY, useClass: OutboxRepository},
  ],
})
export class TreatmentModule {}
