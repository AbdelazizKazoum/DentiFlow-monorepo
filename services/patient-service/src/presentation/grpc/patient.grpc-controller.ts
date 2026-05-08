import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod, RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";
import {ManagePatientsUseCase} from "../../application/use-cases/manage-patients.use-case";
import {ManageInsuranceProvidersUseCase} from "../../application/use-cases/manage-insurance-providers.use-case";
import {ManageInsuranceTemplatesUseCase} from "../../application/use-cases/manage-insurance-templates.use-case";
import {ManagePatientInsurancesUseCase} from "../../application/use-cases/manage-patient-insurances.use-case";
import {ManagePatientDocumentsUseCase} from "../../application/use-cases/manage-patient-documents.use-case";
import {DocumentType} from "../../domain/enums/document-type.enum";
import {PatientStatus} from "../../domain/enums/patient-status.enum";
import {PatientGender} from "../../domain/enums/patient-gender.enum";
import {PatientProto} from "@lib/proto";
import {PatientGrpcMapper} from "./patient.grpc-mapper";
import {
  CreateInsuranceProviderInput,
  CreateInsuranceTemplateInput,
  CreatePatientDocumentInput,
  CreatePatientInput,
  CreatePatientInsuranceInput,
  DeleteManyDocumentsInput,
  ListPatientsInput,
  SearchPatientsByNameInput,
  UpdateInsuranceProviderInput,
  UpdateInsuranceTemplateInput,
  UpdatePatientDocumentInput,
  UpdatePatientInput,
  UpdatePatientInsuranceInput,
} from "./patient.grpc-inputs";

type GetByIdRequest = {id: string};
type ByClinicRequest = {
  clinicId: string;
  isActive?: boolean;
  search?: string;
  type?: string;
  patientId?: string;
};
type ByPatientRequest = {
  clinicId: string;
  patientId: string;
  isActive?: boolean;
  type?: string;
};
type ByUserRequest = {userId: string};
type ByNameSearchRequest = SearchPatientsByNameInput;
type ByProviderRequest = {
  providerId: string;
  providerIds?: string;
  search?: string;
};
type ByIdAndClinicRequest = {id: string; clinicId: string};
type ActivateAllRequest = {clinicId: string; patientId: string};

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class PatientGrpcController {
  constructor(
    private readonly patientsUC: ManagePatientsUseCase,
    private readonly providersUC: ManageInsuranceProvidersUseCase,
    private readonly templatesUC: ManageInsuranceTemplatesUseCase,
    private readonly insurancesUC: ManagePatientInsurancesUseCase,
    private readonly documentsUC: ManagePatientDocumentsUseCase,
  ) {}

  @GrpcMethod("PatientService", "GetPatient")
  async handleGetPatient(data: GetByIdRequest) {
    try {
      const patient = await this.patientsUC.getById(data.id);
      return PatientGrpcMapper.toPatientReply(patient);
    } catch (error) {
      this.rethrowAsRpc(error);
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
      this.rethrowAsRpc(error);
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
      this.rethrowAsRpc(error);
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
      this.rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "GetPatientByUserId")
  async handleGetPatientByUserId(data: ByUserRequest) {
    try {
      const patient = await this.patientsUC.getByUserId(data.userId);
      return PatientGrpcMapper.toPatientReply(patient);
    } catch (error) {
      this.rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "SearchPatientsByName")
  async handleSearchPatientsByName(data: ByNameSearchRequest) {
    const items = await this.patientsUC.searchByName(
      data.clinicId,
      data.firstName,
      data.lastName,
    );
    return {items: items.map(PatientGrpcMapper.toPatientReply)};
  }

  @GrpcMethod("PatientService", "GetInsuranceProvider")
  async handleGetInsuranceProvider(data: GetByIdRequest) {
    try {
      const provider = await this.providersUC.getById(data.id);
      return PatientGrpcMapper.toInsuranceProviderReply(provider);
    } catch (error) {
      this.rethrowAsRpc(error);
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

  @GrpcMethod("PatientService", "GetInsuranceTemplate")
  async handleGetInsuranceTemplate(data: GetByIdRequest) {
    try {
      const template = await this.templatesUC.getById(data.id);
      return PatientGrpcMapper.toInsuranceTemplateReply(template);
    } catch (error) {
      this.rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "ListInsuranceTemplates")
  async handleListInsuranceTemplates(data: ByProviderRequest) {
    const providerIds = data.providerIds
      ? data.providerIds
          .split(",")
          .map((value) => value.trim())
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

  @GrpcMethod("PatientService", "GetPatientInsurance")
  async handleGetPatientInsurance(data: GetByIdRequest) {
    try {
      const insurance = await this.insurancesUC.getById(data.id);
      return PatientGrpcMapper.toPatientInsuranceReply(insurance);
    } catch (error) {
      this.rethrowAsRpc(error);
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
  async handleListClinicPatientInsurances(
    data: ByClinicRequest & {insuranceProviderId?: string},
  ) {
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

  @GrpcMethod("PatientService", "GetPatientDocument")
  async handleGetPatientDocument(data: GetByIdRequest) {
    try {
      const document = await this.documentsUC.getById(data.id);
      return PatientGrpcMapper.toPatientDocumentReply(document);
    } catch (error) {
      this.rethrowAsRpc(error);
    }
  }

  @GrpcMethod("PatientService", "ListPatientDocuments")
  async handleListPatientDocuments(data: ByPatientRequest) {
    const documents = await this.documentsUC.listByPatient(
      data.clinicId,
      data.patientId,
      data.type as DocumentType | undefined,
    );
    return {documents: documents.map(PatientGrpcMapper.toPatientDocumentReply)};
  }

  @GrpcMethod("PatientService", "ListClinicPatientDocuments")
  async handleListClinicPatientDocuments(data: ByClinicRequest) {
    const documents = await this.documentsUC.listByClinic(
      data.clinicId,
      data.type as DocumentType | undefined,
      data.patientId,
      data.search,
    );
    return {documents: documents.map(PatientGrpcMapper.toPatientDocumentReply)};
  }

  @GrpcMethod("PatientService", "CreatePatientDocument")
  async handleCreatePatientDocument(data: CreatePatientDocumentInput) {
    const document = await this.documentsUC.create(data);
    return PatientGrpcMapper.toPatientDocumentReply(document);
  }

  @GrpcMethod("PatientService", "UpdatePatientDocument")
  async handleUpdatePatientDocument(data: UpdatePatientDocumentInput) {
    const document = await this.documentsUC.update(data.documentId, {
      type: data.type,
      title: data.title,
      fileUrl: data.fileUrl,
    });
    return PatientGrpcMapper.toPatientDocumentReply(document);
  }

  @GrpcMethod("PatientService", "DeletePatientDocument")
  async handleDeletePatientDocument(data: GetByIdRequest) {
    await this.documentsUC.delete(data.id);
    return {success: true};
  }

  @GrpcMethod("PatientService", "DeleteManyPatientDocuments")
  async handleDeleteManyPatientDocuments(data: DeleteManyDocumentsInput) {
    await this.documentsUC.deleteMany(data.ids);
    return {success: true};
  }

  private rethrowAsRpc(err: unknown): never {
    if (err instanceof RpcException) throw err;

    const httpErr = err as {status?: number; message?: string};
    const httpStatus = httpErr?.status;
    const message = httpErr?.message ?? "Unknown error";

    if (httpStatus === 409)
      throw new RpcException({code: status.ALREADY_EXISTS, message});
    if (httpStatus === 404)
      throw new RpcException({code: status.NOT_FOUND, message});
    if (httpStatus === 400)
      throw new RpcException({code: status.INVALID_ARGUMENT, message});

    throw new RpcException({
      code: status.INTERNAL,
      message: "Internal server error",
    });
  }
}
