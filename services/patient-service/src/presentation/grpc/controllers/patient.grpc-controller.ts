import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {ManagePatientsUseCase} from "../../../application/use-cases/manage-patients.use-case";
import {PatientStatus} from "../../../domain/enums/patient-status.enum";
import {PatientGender} from "../../../domain/enums/patient-gender.enum";
import {PatientProto} from "@lib/proto";
import {PatientGrpcMapper} from "../patient.grpc-mapper";
import {
  CreatePatientInput,
  ListPatientsInput,
  SearchPatientsByNameInput,
  UpdatePatientInput,
} from "../patient.grpc-inputs";
import {rethrowAsRpc} from "../rpc-error.helper";

type GetByIdRequest = {id: string};
type ByUserRequest = {userId: string};

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class PatientGrpcController {
  constructor(private readonly patientsUC: ManagePatientsUseCase) {}

  @GrpcMethod("PatientService", "GetPatient")
  async handleGetPatient(data: GetByIdRequest) {
    try {
      const patient = await this.patientsUC.getById(data.id);
      return PatientGrpcMapper.toPatientReply(patient);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "ListPatients")
  async handleListPatients(
    data: ListPatientsInput,
  ): Promise<PatientProto.PatientsListReply> {
    const result = await this.patientsUC.list({
      clinicId: data.clinicId,
      page: data.page,
      limit: data.limit,
      status: data.status as PatientStatus | undefined,
      gender: data.gender as PatientGender | undefined,
      search: data.search,
      isNew: data.isNew,
      createdFrom: data.createdFrom ? new Date(data.createdFrom) : undefined,
      createdTo: data.createdTo ? new Date(data.createdTo) : undefined,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
    });

    return {
      items: result.items.map(PatientGrpcMapper.toPatientListItemReply),
      meta: result.meta,
    };
  }

  @GrpcMethod("PatientService", "CreatePatient")
  async handleCreatePatient(data: CreatePatientInput) {
    try {
      const created = await this.patientsUC.create({
        clinicId: data.clinicId,
        firstName: data.firstName,
        lastName: data.lastName,
        userId: data.userId,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        address: data.address,
        notes: data.notes,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        currentMedications: data.currentMedications,
        medicalNotes: data.medicalNotes,
        status: data.status,
      });
      return PatientGrpcMapper.toPatientReply(created);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "UpdatePatient")
  async handleUpdatePatient(data: UpdatePatientInput) {
    try {
      const updated = await this.patientsUC.update(data.patientId, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        dateOfBirth:
          data.dateOfBirth === undefined
            ? undefined
            : data.dateOfBirth === null
              ? null
              : new Date(data.dateOfBirth),
        gender: data.gender,
        address: data.address,
        notes: data.notes,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        currentMedications: data.currentMedications,
        medicalNotes: data.medicalNotes,
        status: data.status,
      });
      return PatientGrpcMapper.toPatientReply(updated);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "DeletePatient")
  async handleDeletePatient(data: GetByIdRequest) {
    await this.patientsUC.delete(data.id);
    return {success: true};
  }

  @GrpcMethod("PatientService", "SoftDeletePatient")
  async handleSoftDeletePatient(data: GetByIdRequest) {
    await this.patientsUC.softDelete(data.id);
    return {success: true};
  }

  @GrpcMethod("PatientService", "RestorePatient")
  async handleRestorePatient(data: GetByIdRequest) {
    try {
      const restored = await this.patientsUC.restore(data.id);
      return PatientGrpcMapper.toPatientReply(restored);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "GetPatientByUserId")
  async handleGetPatientByUserId(data: ByUserRequest) {
    try {
      const patient = await this.patientsUC.getByUserId(data.userId);
      return PatientGrpcMapper.toPatientReply(patient);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "SearchPatientsByName")
  async handleSearchPatientsByName(data: SearchPatientsByNameInput) {
    const items = await this.patientsUC.searchByName(
      data.clinicId,
      data.firstName,
      data.lastName,
    );
    return {items: items.map(PatientGrpcMapper.toPatientReply)};
  }
}
