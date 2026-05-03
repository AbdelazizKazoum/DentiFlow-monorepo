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
import {ClinicController} from "../presentation/controllers/clinic.controller";
import {ClinicGrpcController} from "../presentation/grpc/clinic.grpc-controller";
import {
  CLINIC_REPOSITORY,
  WORKING_HOURS_REPOSITORY,
  STAFF_MEMBER_REPOSITORY,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClinicTypeOrmEntity,
      WorkingHoursTypeOrmEntity,
      StaffMemberTypeOrmEntity,
    ]),
  ],
  controllers: [ClinicController, ClinicGrpcController],
  providers: [
    CreateClinicUseCase,
    GetClinicUseCase,
    UpsertWorkingHoursUseCase,
    GetWorkingHoursUseCase,
    CreateStaffMemberUseCase,
    GetStaffMemberUseCase,
    ListStaffMembersUseCase,
    {provide: CLINIC_REPOSITORY, useClass: ClinicRepository},
    {provide: WORKING_HOURS_REPOSITORY, useClass: WorkingHoursRepository},
    {provide: STAFF_MEMBER_REPOSITORY, useClass: StaffMemberRepository},
  ],
})
export class ClinicModule {}
