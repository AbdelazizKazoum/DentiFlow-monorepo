import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {ManageInsuranceProvidersUseCase} from "../../../application/use-cases/manage-insurance-providers.use-case";
import {PatientGrpcMapper} from "../patient.grpc-mapper";
import {
  CreateInsuranceProviderInput,
  UpdateInsuranceProviderInput,
} from "../patient.grpc-inputs";
import {rethrowAsRpc} from "../rpc-error.helper";

type GetByIdRequest = {id: string};
type ByClinicRequest = {clinicId: string; isActive?: boolean; search?: string};

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class InsuranceProviderGrpcController {
  constructor(private readonly providersUC: ManageInsuranceProvidersUseCase) {}

  @GrpcMethod("PatientService", "GetInsuranceProvider")
  async handleGetInsuranceProvider(data: GetByIdRequest) {
    try {
      const provider = await this.providersUC.getById(data.id);
      return PatientGrpcMapper.toInsuranceProviderReply(provider);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "ListInsuranceProviders")
  async handleListInsuranceProviders(data: ByClinicRequest) {
    const providers = await this.providersUC.list(
      data.clinicId,
      data.isActive,
      data.search,
    );
    return {
      providers: providers.map(PatientGrpcMapper.toInsuranceProviderReply),
    };
  }

  @GrpcMethod("PatientService", "CreateInsuranceProvider")
  async handleCreateInsuranceProvider(data: CreateInsuranceProviderInput) {
    const provider = await this.providersUC.create(data);
    return PatientGrpcMapper.toInsuranceProviderReply(provider);
  }

  @GrpcMethod("PatientService", "UpdateInsuranceProvider")
  async handleUpdateInsuranceProvider(data: UpdateInsuranceProviderInput) {
    const provider = await this.providersUC.update(data.providerId, {
      name: data.name,
      code: data.code,
      isActive: data.isActive,
    });
    return PatientGrpcMapper.toInsuranceProviderReply(provider);
  }

  @GrpcMethod("PatientService", "DeleteInsuranceProvider")
  async handleDeleteInsuranceProvider(data: GetByIdRequest) {
    await this.providersUC.delete(data.id);
    return {success: true};
  }

  @GrpcMethod("PatientService", "ActivateInsuranceProvider")
  async handleActivateInsuranceProvider(data: GetByIdRequest) {
    const provider = await this.providersUC.activate(data.id);
    return PatientGrpcMapper.toInsuranceProviderReply(provider);
  }

  @GrpcMethod("PatientService", "DeactivateInsuranceProvider")
  async handleDeactivateInsuranceProvider(data: GetByIdRequest) {
    const provider = await this.providersUC.deactivate(data.id);
    return PatientGrpcMapper.toInsuranceProviderReply(provider);
  }
}
