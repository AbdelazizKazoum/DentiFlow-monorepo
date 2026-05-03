import {Inject, Injectable} from "@nestjs/common";
import {StaffMember} from "../../domain/entities/staff-member";
import {IStaffMemberRepository} from "../../domain/repositories/staff-member-repository.interface";
import {STAFF_MEMBER_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ListStaffMembersUseCase {
  constructor(
    @Inject(STAFF_MEMBER_REPOSITORY)
    private readonly staffMemberRepository: IStaffMemberRepository,
  ) {}

  async execute(clinicId: string): Promise<StaffMember[]> {
    return this.staffMemberRepository.findByClinic(clinicId);
  }
}
