import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ManageActCatalogUseCase} from "../application/use-cases/manage-act-catalog.use-case";
import {ManageTreatmentActsUseCase} from "../application/use-cases/manage-treatment-acts.use-case";
import {ManageVisitsUseCase} from "../application/use-cases/manage-visits.use-case";
import {ActCatalogTypeOrmEntity} from "../infrastructure/persistence/entities/act-catalog.typeorm-entity";
import {OutboxTypeOrmEntity} from "../infrastructure/persistence/entities/outbox.typeorm-entity";
import {TreatmentActTypeOrmEntity} from "../infrastructure/persistence/entities/treatment-act.typeorm-entity";
import {VisitTypeOrmEntity} from "../infrastructure/persistence/entities/visit.typeorm-entity";
import {ActCatalogRepository} from "../infrastructure/persistence/repositories/act-catalog.repository";
import {OutboxRepository} from "../infrastructure/persistence/repositories/outbox.repository";
import {TreatmentActRepository} from "../infrastructure/persistence/repositories/treatment-act.repository";
import {VisitRepository} from "../infrastructure/persistence/repositories/visit.repository";
import {OutboxRelayService} from "../infrastructure/nats/outbox-relay.service";
import {TreatmentGrpcController} from "../presentation/grpc/treatment.grpc-controller";
import {
  ACT_CATALOG_REPOSITORY,
  OUTBOX_REPOSITORY,
  TREATMENT_ACT_REPOSITORY,
  VISIT_REPOSITORY,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActCatalogTypeOrmEntity,
      VisitTypeOrmEntity,
      TreatmentActTypeOrmEntity,
      OutboxTypeOrmEntity,
    ]),
  ],
  controllers: [TreatmentGrpcController],
  providers: [
    ManageActCatalogUseCase,
    ManageVisitsUseCase,
    ManageTreatmentActsUseCase,
    OutboxRelayService,
    {provide: ACT_CATALOG_REPOSITORY, useClass: ActCatalogRepository},
    {provide: VISIT_REPOSITORY, useClass: VisitRepository},
    {provide: TREATMENT_ACT_REPOSITORY, useClass: TreatmentActRepository},
    {provide: OUTBOX_REPOSITORY, useClass: OutboxRepository},
  ],
})
export class TreatmentModule {}
