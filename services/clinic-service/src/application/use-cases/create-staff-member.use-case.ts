import {ConflictException, Inject, Injectable} from "@nestjs/common";
import {StaffMember} from "../../domain/entities/staff-member";
import {IStaffMemberRepository} from "../../domain/repositories/staff-member-repository.interface";
import {StaffRole} from "../../domain/enums/staff-role.enum";
import {StaffStatus} from "../../domain/enums/staff-status.enum";
import {STAFF_MEMBER_REPOSITORY} from "../../shared/constants/injection-tokens";

export interface CreateStaffMemberInput {
  userId: string;
  role: StaffRole;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialization?: string;
  avatar?: string;
}

@Injectable()
export class CreateStaffMemberUseCase {
  constructor(
    @Inject(STAFF_MEMBER_REPOSITORY)
    private readonly staffMemberRepository: IStaffMemberRepository,
  ) {}

  async execute(
    clinicId: string,
    input: CreateStaffMemberInput,
  ): Promise<StaffMember> {
    const existing = await this.staffMemberRepository.findByUserAndClinic(
      input.userId,
      clinicId,
    );
    if (existing) {
      throw new ConflictException(
        `User "${input.userId}" is already a staff member of clinic "${clinicId}"`,
      );
    }

    const staffMember = new StaffMember(
      "",
      clinicId,
      input.userId,
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
