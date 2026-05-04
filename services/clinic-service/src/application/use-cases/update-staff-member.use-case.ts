import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {StaffMember} from "../../domain/entities/staff-member";
import {IStaffMemberRepository} from "../../domain/repositories/staff-member-repository.interface";
import {StaffRole} from "../../domain/enums/staff-role.enum";
import {StaffStatus} from "../../domain/enums/staff-status.enum";
import {STAFF_MEMBER_REPOSITORY} from "../../shared/constants/injection-tokens";

export interface UpdateStaffMemberInput {
  role?: StaffRole;
  status?: StaffStatus;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  specialization?: string | null;
  avatar?: string | null;
}

@Injectable()
export class UpdateStaffMemberUseCase {
  constructor(
    @Inject(STAFF_MEMBER_REPOSITORY)
    private readonly staffMemberRepository: IStaffMemberRepository,
  ) {}

  async execute(
    staffMemberId: string,
    clinicId: string,
    input: UpdateStaffMemberInput,
  ): Promise<StaffMember> {
    const existing = await this.staffMemberRepository.findById(
      staffMemberId,
      clinicId,
    );

    if (!existing) {
      throw new NotFoundException(
        `Staff member "${staffMemberId}" not found in clinic "${clinicId}"`,
      );
    }

    const updated = new StaffMember(
      existing.id,
      existing.clinicId,
      existing.userId,
      input.role ?? existing.role,
      input.status ?? existing.status,
      input.firstName ?? existing.firstName,
      input.lastName ?? existing.lastName,
      input.phone !== undefined ? input.phone : existing.phone,
      existing.email,
      input.specialization !== undefined
        ? input.specialization
        : existing.specialization,
      input.avatar !== undefined ? input.avatar : existing.avatar,
      existing.isActive,
      existing.createdAt,
      existing.updatedAt,
    );

    return this.staffMemberRepository.save(updated);
  }
}
