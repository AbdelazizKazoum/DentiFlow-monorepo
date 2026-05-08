import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {ManagePatientInsurancesUseCase} from "../../../application/use-cases/manage-patient-insurances.use-case";
import {PatientGrpcMapper} from "../patient.grpc-mapper";
import {
  CreatePatientInsuranceInput,
  UpdatePatientInsuranceInput,
} from "../patient.grpc-inputs";
import {rethrowAsRpc} from "../rpc-error.helper";

type GetByIdRequest = {id: string};
type ByPatientRequest = {
  clinicId: string;
  patientId: string;
  isActive?: boolean;
};
type ByClinicRequest = {
  clinicId: string;
  isActive?: boolean;
  insuranceProviderId?: string;
};
type ActivateAllRequest = {clinicId: string; patientId: string};

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class PatientInsuranceGrpcController {
  constructor(private readonly insurancesUC: ManagePatientInsurancesUseCase) {}

  @GrpcMethod("PatientService", "GetPatientInsurance")
  async handleGetPatientInsurance(data: GetByIdRequest) {
    try {
      const insurance = await this.insurancesUC.getById(data.id);
      return PatientGrpcMapper.toPatientInsuranceReply(insurance);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "ListPatientInsurances")
  async handleListPatientInsurances(data: ByPatientRequest) {
    const insurances = await this.insurancesUC.listByPatient(
      data.clinicId,
      data.patientId,
      data.isActive,
    );
    return {
      insurances: insurances.map(PatientGrpcMapper.toPatientInsuranceReply),
    };
  }

  @GrpcMethod("PatientService", "ListClinicPatientInsurances")
  async handleListClinicPatientInsurances(data: ByClinicRequest) {
    const insurances = await this.insurancesUC.listByClinic(
      data.clinicId,
      data.isActive,
      data.insuranceProviderId,
    );
    return {
      insurances: insurances.map(PatientGrpcMapper.toPatientInsuranceReply),
    };
  }

  @GrpcMethod("PatientService", "CreatePatientInsurance")
  async handleCreatePatientInsurance(data: CreatePatientInsuranceInput) {
    const insurance = await this.insurancesUC.create(data);
    return PatientGrpcMapper.toPatientInsuranceReply(insurance);
  }

  @GrpcMethod("PatientService", "UpdatePatientInsurance")
  async handleUpdatePatientInsurance(data: UpdatePatientInsuranceInput) {
    const insurance = await this.insurancesUC.update(data.insuranceId, {
      policyNumber: data.policyNumber,
      memberId: data.memberId,
      isActive: data.isActive,
    });
    return PatientGrpcMapper.toPatientInsuranceReply(insurance);
  }

  @GrpcMethod("PatientService", "DeletePatientInsurance")
  async handleDeletePatientInsurance(data: GetByIdRequest) {
    await this.insurancesUC.delete(data.id);
    return {success: true};
  }

  @GrpcMethod("PatientService", "ActivatePatientInsurance")
  async handleActivatePatientInsurance(data: GetByIdRequest) {
    const insurance = await this.insurancesUC.activate(data.id);
    return PatientGrpcMapper.toPatientInsuranceReply(insurance);
  }

  @GrpcMethod("PatientService", "DeactivatePatientInsurance")
  async handleDeactivatePatientInsurance(data: GetByIdRequest) {
    const insurance = await this.insurancesUC.deactivate(data.id);
    return PatientGrpcMapper.toPatientInsuranceReply(insurance);
  }

  @GrpcMethod("PatientService", "ActivateAllPatientInsurances")
  async handleActivateAllPatientInsurances(data: ActivateAllRequest) {
    await this.insurancesUC.activateAll(data.clinicId, data.patientId);
    return {success: true};
  }

  @GrpcMethod("PatientService", "DeactivateAllPatientInsurances")
  async handleDeactivateAllPatientInsurances(data: ActivateAllRequest) {
    await this.insurancesUC.deactivateAll(data.clinicId, data.patientId);
    return {success: true};
  }
}
