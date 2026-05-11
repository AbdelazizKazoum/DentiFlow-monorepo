import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AppointmentTypeOrmEntity} from "../infrastructure/persistence/entities/appointment.typeorm-entity";
import {QueueEntryTypeOrmEntity} from "../infrastructure/persistence/entities/queue-entry.typeorm-entity";
import {OutboxTypeOrmEntity} from "../infrastructure/persistence/entities/outbox.typeorm-entity";
import {AppointmentRepository} from "../infrastructure/persistence/repositories/appointment.repository";
import {QueueRepository} from "../infrastructure/persistence/repositories/queue.repository";
import {OutboxRepository} from "../infrastructure/persistence/repositories/outbox.repository";
import {ManageAppointmentsUseCase} from "../application/use-cases/manage-appointments.use-case";
import {ManageQueueUseCase} from "../application/use-cases/manage-queue.use-case";
import {AppointmentGrpcController} from "../presentation/grpc/appointment.grpc-controller";
import {PatientGrpcClientModule} from "../infrastructure/grpc/patient-grpc-client.module";
import {ClinicGrpcClientModule} from "../infrastructure/grpc/clinic-grpc-client.module";
import {PatientServiceGrpcAdapter} from "../infrastructure/grpc/patient-service-grpc.adapter";
import {ClinicServiceGrpcAdapter} from "../infrastructure/grpc/clinic-service-grpc.adapter";
import {OutboxRelayService} from "../infrastructure/nats/outbox-relay.service";
import {
  APPOINTMENT_REPOSITORY,
  OUTBOX_REPOSITORY,
  QUEUE_REPOSITORY,
} from "../shared/constants/injection-tokens";
import {
  CLINIC_SERVICE_CLIENT,
  PATIENT_SERVICE_CLIENT,
} from "../infrastructure/grpc/tokens";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppointmentTypeOrmEntity,
      QueueEntryTypeOrmEntity,
      OutboxTypeOrmEntity,
    ]),
    PatientGrpcClientModule,
    ClinicGrpcClientModule,
  ],
  controllers: [AppointmentGrpcController],
  providers: [
    ManageAppointmentsUseCase,
    ManageQueueUseCase,
    OutboxRelayService,
    {provide: APPOINTMENT_REPOSITORY, useClass: AppointmentRepository},
    {provide: QUEUE_REPOSITORY, useClass: QueueRepository},
    {provide: OUTBOX_REPOSITORY, useClass: OutboxRepository},
    {provide: PATIENT_SERVICE_CLIENT, useClass: PatientServiceGrpcAdapter},
    {provide: CLINIC_SERVICE_CLIENT, useClass: ClinicServiceGrpcAdapter},
  ],
})
export class AppointmentModule {}
