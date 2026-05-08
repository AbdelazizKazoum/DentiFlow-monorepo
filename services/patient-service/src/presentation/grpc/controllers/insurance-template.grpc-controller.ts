import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {ManageInsuranceTemplatesUseCase} from "../../../application/use-cases/manage-insurance-templates.use-case";
import {PatientGrpcMapper} from "../patient.grpc-mapper";
import {
  CreateInsuranceTemplateInput,
  UpdateInsuranceTemplateInput,
} from "../patient.grpc-inputs";
import {rethrowAsRpc} from "../rpc-error.helper";

type GetByIdRequest = {id: string};
type ByProviderRequest = {
  providerId: string;
  providerIds?: string;
  search?: string;
};

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class InsuranceTemplateGrpcController {
  constructor(private readonly templatesUC: ManageInsuranceTemplatesUseCase) {}

  @GrpcMethod("PatientService", "GetInsuranceTemplate")
  async handleGetInsuranceTemplate(data: GetByIdRequest) {
    try {
      const template = await this.templatesUC.getById(data.id);
      return PatientGrpcMapper.toInsuranceTemplateReply(template);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "ListInsuranceTemplates")
  async handleListInsuranceTemplates(data: ByProviderRequest) {
    const providerIds = data.providerIds
      ? data.providerIds
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : undefined;
    const templates = await this.templatesUC.list(
      data.providerId,
      providerIds,
      data.search,
    );
    return {
      templates: templates.map(PatientGrpcMapper.toInsuranceTemplateReply),
    };
  }

  @GrpcMethod("PatientService", "CreateInsuranceTemplate")
  async handleCreateInsuranceTemplate(data: CreateInsuranceTemplateInput) {
    const template = await this.templatesUC.create(data);
    return PatientGrpcMapper.toInsuranceTemplateReply(template);
  }

  @GrpcMethod("PatientService", "UpdateInsuranceTemplate")
  async handleUpdateInsuranceTemplate(data: UpdateInsuranceTemplateInput) {
    const template = await this.templatesUC.update(data.templateId, {
      name: data.name,
      fileUrl: data.fileUrl,
    });
    return PatientGrpcMapper.toInsuranceTemplateReply(template);
  }

  @GrpcMethod("PatientService", "DeleteInsuranceTemplate")
  async handleDeleteInsuranceTemplate(data: GetByIdRequest) {
    await this.templatesUC.delete(data.id);
    return {success: true};
  }
}
