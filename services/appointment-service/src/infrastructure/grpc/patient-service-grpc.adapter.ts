import {Inject, Injectable, OnModuleInit} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {PatientProto} from "@lib/proto";
import {
  PatientServicePort,
  PatientSnapshot,
} from "../../application/ports/patient-service.port";
import {PATIENT_GRPC_CLIENT} from "./tokens";

@Injectable()
export class PatientServiceGrpcAdapter
  implements PatientServicePort, OnModuleInit
{
  private service!: PatientProto.PatientServiceClient;

  constructor(@Inject(PATIENT_GRPC_CLIENT) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.service = this.client.getService<PatientProto.PatientServiceClient>(
      PatientProto.PATIENT_SERVICE_NAME,
    );
  }

  async getPatient(id: string): Promise<PatientSnapshot> {
    const patient = await lastValueFrom(this.service.getPatient({id}));
    return {
      id: patient.id,
      clinicId: patient.clinicId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone || undefined,
    };
  }
}
