import {ConflictException, Inject, Injectable} from "@nestjs/common";
import {StaffMember} from "../../domain/entities/staff-member";
import {IStaffMemberRepository} from "../../domain/repositories/staff-member-repository.interface";
import {StaffRole} from "../../domain/enums/staff-role.enum";
import {StaffStatus} from "../../domain/enums/staff-status.enum";
import {
  STAFF_MEMBER_REPOSITORY,
  AUTH_SERVICE_CLIENT,
} from "../../shared/constants/injection-tokens";
import {IAuthServicePort} from "../ports/auth-service.port";

export interface CreateStaffMemberInput {
  role: StaffRole;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  avatar?: string;
}

@Injectable()
export class CreateStaffMemberUseCase {
  constructor(
    @Inject(STAFF_MEMBER_REPOSITORY)
    private readonly staffMemberRepository: IStaffMemberRepository,
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authServicePort: IAuthServicePort,
  ) {}

  async execute(
    clinicId: string,
    input: CreateStaffMemberInput,
  ): Promise<StaffMember> {
    const registeredUser = await this.authServicePort.registerStaffUser({
      email: input.email,
      password: input.password,
      fullName: `${input.firstName} ${input.lastName}`,
      role: input.role,
      clinicId,
    });

    const existing = await this.staffMemberRepository.findByUserAndClinic(
      registeredUser.userId,
      clinicId,
    );

    if (existing) {
      throw new ConflictException(
        `User "${registeredUser.fullName}" is already a staff member of clinic "${clinicId}"`,
      );
    }

    const staffMember = new StaffMember(
      "",
      clinicId,
      registeredUser.userId,
      input.role,
      StaffStatus.ACTIVE,
      input.firstName,
      input.lastName,
      input.phone ?? null,
      input.email ?? null,
      input.specialization ?? null,
      input.avatar ?? null,
      true,
      new Date(),
      new Date(),
    );

    return this.staffMemberRepository.save(staffMember);
  }
}
