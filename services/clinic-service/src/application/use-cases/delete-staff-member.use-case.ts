import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {IStaffMemberRepository} from "../../domain/repositories/staff-member-repository.interface";
import {STAFF_MEMBER_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class DeleteStaffMemberUseCase {
  constructor(
    @Inject(STAFF_MEMBER_REPOSITORY)
    private readonly staffMemberRepository: IStaffMemberRepository,
  ) {}

  async execute(staffMemberId: string, clinicId: string): Promise<void> {
    const existing = await this.staffMemberRepository.findById(
      staffMemberId,
      clinicId,
    );

    if (!existing) {
      throw new NotFoundException(
        `Staff member "${staffMemberId}" not found in clinic "${clinicId}"`,
      );
    }

    await this.staffMemberRepository.delete(staffMemberId);
  }
}
