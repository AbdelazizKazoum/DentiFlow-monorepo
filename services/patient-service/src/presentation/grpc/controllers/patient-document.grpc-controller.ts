import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {ManagePatientDocumentsUseCase} from "../../../application/use-cases/manage-patient-documents.use-case";
import {DocumentType} from "../../../domain/enums/document-type.enum";
import {PatientGrpcMapper} from "../patient.grpc-mapper";
import {
  CreatePatientDocumentInput,
  DeleteManyDocumentsInput,
  UpdatePatientDocumentInput,
} from "../patient.grpc-inputs";
import {rethrowAsRpc} from "../rpc-error.helper";

type GetByIdRequest = {id: string};
type ByPatientRequest = {
  clinicId: string;
  patientId: string;
  type?: string;
};
type ByClinicRequest = {
  clinicId: string;
  type?: string;
  patientId?: string;
  search?: string;
};

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class PatientDocumentGrpcController {
  constructor(private readonly documentsUC: ManagePatientDocumentsUseCase) {}

  @GrpcMethod("PatientService", "GetPatientDocument")
  async handleGetPatientDocument(data: GetByIdRequest) {
    try {
      const document = await this.documentsUC.getById(data.id);
      return PatientGrpcMapper.toPatientDocumentReply(document);
    } catch (error) {
      rethrowAsRpc(error);
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
}
