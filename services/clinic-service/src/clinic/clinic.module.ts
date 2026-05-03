import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ClinicTypeOrmEntity} from "../infrastructure/persistence/entities/clinic.typeorm-entity";
import {WorkingHoursTypeOrmEntity} from "../infrastructure/persistence/entities/working-hours.typeorm-entity";
import {StaffMemberTypeOrmEntity} from "../infrastructure/persistence/entities/staff-member.typeorm-entity";
import {ClinicRepository} from "../infrastructure/persistence/repositories/clinic.repository";
import {WorkingHoursRepository} from "../infrastructure/persistence/repositories/working-hours.repository";
import {StaffMemberRepository} from "../infrastructure/persistence/repositories/staff-member.repository";
import {CreateClinicUseCase} from "../application/use-cases/create-clinic.use-case";
import {GetClinicUseCase} from "../application/use-cases/get-clinic.use-case";
import {UpsertWorkingHoursUseCase} from "../application/use-cases/upsert-working-hours.use-case";
import {GetWorkingHoursUseCase} from "../application/use-cases/get-working-hours.use-case";
import {CreateStaffMemberUseCase} from "../application/use-cases/create-staff-member.use-case";
import {GetStaffMemberUseCase} from "../application/use-cases/get-staff-member.use-case";
import {ListStaffMembersUseCase} from "../application/use-cases/list-staff-members.use-case";
import {ClinicGrpcController} from "../presentation/grpc/clinic.grpc-controller";
import {AuthGrpcClientModule} from "../infrastructure/grpc/auth-grpc-client.module";
import {AuthServiceGrpcAdapter} from "../infrastructure/grpc/auth-service-grpc.adapter";
import {
  CLINIC_REPOSITORY,
  WORKING_HOURS_REPOSITORY,
  STAFF_MEMBER_REPOSITORY,
  AUTH_SERVICE_CLIENT,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClinicTypeOrmEntity,
      WorkingHoursTypeOrmEntity,
      StaffMemberTypeOrmEntity,
    ]),
    AuthGrpcClientModule,
  ],
  controllers: [ClinicGrpcController],
  providers: [
    CreateClinicUseCase,
    GetClinicUseCase,
    UpsertWorkingHoursUseCase,
    GetWorkingHoursUseCase,
    CreateStaffMemberUseCase,
    GetStaffMemberUseCase,
    ListStaffMembersUseCase,
    AuthServiceGrpcAdapter,
    {provide: CLINIC_REPOSITORY, useClass: ClinicRepository},
    {provide: WORKING_HOURS_REPOSITORY, useClass: WorkingHoursRepository},
    {provide: STAFF_MEMBER_REPOSITORY, useClass: StaffMemberRepository},
    {provide: AUTH_SERVICE_CLIENT, useClass: AuthServiceGrpcAdapter},
  ],
})
export class ClinicModule {}
