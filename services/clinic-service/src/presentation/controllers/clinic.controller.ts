import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {CreateClinicUseCase} from "../../application/use-cases/create-clinic.use-case";
import {GetClinicUseCase} from "../../application/use-cases/get-clinic.use-case";
import {UpsertWorkingHoursUseCase} from "../../application/use-cases/upsert-working-hours.use-case";
import {GetWorkingHoursUseCase} from "../../application/use-cases/get-working-hours.use-case";
import {CreateStaffMemberUseCase} from "../../application/use-cases/create-staff-member.use-case";
import {GetStaffMemberUseCase} from "../../application/use-cases/get-staff-member.use-case";
import {ListStaffMembersUseCase} from "../../application/use-cases/list-staff-members.use-case";
import {CreateClinicDto} from "../dto/create-clinic.dto";
import {UpsertWorkingHoursDto} from "../dto/upsert-working-hours.dto";
import {CreateStaffMemberDto} from "../dto/create-staff-member.dto";

@ApiTags("clinics")
@Controller("clinics")
export class ClinicController {
  constructor(
    private readonly createClinic: CreateClinicUseCase,
    private readonly getClinic: GetClinicUseCase,
    private readonly upsertWorkingHours: UpsertWorkingHoursUseCase,
    private readonly getWorkingHours: GetWorkingHoursUseCase,
    private readonly createStaffMember: CreateStaffMemberUseCase,
    private readonly getStaffMember: GetStaffMemberUseCase,
    private readonly listStaffMembers: ListStaffMembersUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateClinicDto) {
    return this.createClinic.execute(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.getClinic.execute(id);
  }

  @Put(":id/working-hours")
  upsertHours(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertWorkingHoursDto,
  ) {
    return this.upsertWorkingHours.execute(id, dto.entries);
  }

  @Get(":id/working-hours")
  getHours(@Param("id", ParseUUIDPipe) id: string) {
    return this.getWorkingHours.execute(id);
  }

  @Post(":id/staff")
  addStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateStaffMemberDto,
  ) {
    return this.createStaffMember.execute(id, dto);
  }

  @Get(":id/staff")
  listStaff(@Param("id", ParseUUIDPipe) id: string) {
    return this.listStaffMembers.execute(id);
  }

  @Get(":id/staff/:userId")
  getStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    return this.getStaffMember.execute(userId, id);
  }
}
