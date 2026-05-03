import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {StaffMember} from "../../domain/entities/staff-member";
import {IStaffMemberRepository} from "../../domain/repositories/staff-member-repository.interface";
import {STAFF_MEMBER_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class GetStaffMemberUseCase {
  constructor(
    @Inject(STAFF_MEMBER_REPOSITORY)
    private readonly staffMemberRepository: IStaffMemberRepository,
  ) {}

  async execute(userId: string, clinicId: string): Promise<StaffMember> {
    const staffMember = await this.staffMemberRepository.findByUserAndClinic(
      userId,
      clinicId,
    );
    if (!staffMember) {
      throw new NotFoundException(
        `Staff member with userId "${userId}" not found in clinic "${clinicId}"`,
      );
    }
    return staffMember;
  }
}
