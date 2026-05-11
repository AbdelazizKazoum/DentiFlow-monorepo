import {Inject, Injectable, OnModuleInit} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {ClinicProto} from "@lib/proto";
import {
  ClinicServicePort,
  StaffSnapshot,
} from "../../application/ports/clinic-service.port";
import {CLINIC_GRPC_CLIENT} from "./tokens";

@Injectable()
export class ClinicServiceGrpcAdapter implements ClinicServicePort, OnModuleInit {
  private service!: ClinicProto.ClinicServiceClient;

  constructor(@Inject(CLINIC_GRPC_CLIENT) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.service = this.client.getService<ClinicProto.ClinicServiceClient>(
      ClinicProto.CLINIC_SERVICE_NAME,
    );
  }

  async getStaffMember(
    userId: string,
    clinicId: string,
  ): Promise<StaffSnapshot> {
    const staff = await lastValueFrom(
      this.service.getStaffMember({userId, clinicId}),
    );
    return {
      userId: staff.userId,
      clinicId: staff.clinicId,
      role: staff.role,
      firstName: staff.firstName,
      lastName: staff.lastName,
    };
  }
}
