import {PatientProto} from "@lib/proto";
import {Patient} from "../../domain/entities/patient";
import {InsuranceProvider} from "../../domain/entities/insurance-provider";
import {InsuranceTemplate} from "../../domain/entities/insurance-template";
import {PatientInsurance} from "../../domain/entities/patient-insurance";
import {PatientDocument} from "../../domain/entities/patient-document";
import {PatientListItem} from "../../domain/repositories/patient-repository.interface";

export class PatientGrpcMapper {
  static toPatientReply(p: Patient): PatientProto.PatientReply {
    return {
      id: p.id,
      clinicId: p.clinicId,
      firstName: p.firstName,
      lastName: p.lastName,
      status: p.status,
      userId: p.userId ?? "",
      phone: p.phone ?? "",
      email: p.email ?? "",
      dateOfBirth: p.dateOfBirth?.toISOString() ?? "",
      gender: p.gender ?? "",
      address: p.address ?? "",
      notes: p.notes ?? "",
      allergies: p.allergies ?? "",
      chronicConditions: p.chronicConditions ?? "",
      currentMedications: p.currentMedications ?? "",
      medicalNotes: p.medicalNotes ?? "",
      deletedAt: p.deletedAt?.toISOString() ?? "",
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  static toPatientListItemReply(
    p: PatientListItem,
  ): PatientProto.PatientListItem {
    return {
      id: p.id,
      clinicId: p.clinicId,
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: p.fullName,
      status: p.status,
      phone: p.phone ?? "",
      email: p.email ?? "",
      dateOfBirth: p.dateOfBirth?.toISOString() ?? "",
      gender: p.gender ?? "",
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  static toInsuranceProviderReply(
    i: InsuranceProvider,
  ): PatientProto.InsuranceProviderReply {
    return {
      id: i.id,
      clinicId: i.clinicId,
      name: i.name,
      code: i.code ?? "",
      isActive: i.isActive,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    };
  }

  static toInsuranceTemplateReply(
    i: InsuranceTemplate,
  ): PatientProto.InsuranceTemplateReply {
    return {
      id: i.id,
      insuranceProviderId: i.insuranceProviderId,
      name: i.name,
      fileUrl: i.fileUrl,
      createdAt: i.createdAt.toISOString(),
    };
  }

  static toPatientInsuranceReply(
    i: PatientInsurance,
  ): PatientProto.PatientInsuranceReply {
    return {
      id: i.id,
      clinicId: i.clinicId,
      patientId: i.patientId,
      insuranceProviderId: i.insuranceProviderId,
      policyNumber: i.policyNumber ?? "",
      memberId: i.memberId ?? "",
      isActive: i.isActive,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    };
  }

  static toPatientDocumentReply(
    d: PatientDocument,
  ): PatientProto.PatientDocumentReply {
    return {
      id: d.id,
      clinicId: d.clinicId,
      patientId: d.patientId,
      type: d.type,
      title: d.title ?? "",
      fileUrl: d.fileUrl,
      createdAt: d.createdAt.toISOString(),
    };
  }
}
