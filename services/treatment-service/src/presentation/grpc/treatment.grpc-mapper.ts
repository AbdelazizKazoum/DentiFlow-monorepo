import {TreatmentProto} from "@lib/proto";
import {ActCatalog} from "../../domain/entities/act-catalog";
import {TreatmentAct} from "../../domain/entities/treatment-act";
import {Visit} from "../../domain/entities/visit";

export class TreatmentGrpcMapper {
  static toVisitReply(
    visit: Visit,
    acts: TreatmentAct[] = [],
  ): TreatmentProto.VisitReply {
    return {
      id: visit.id,
      clinicId: visit.clinicId,
      appointmentId: visit.appointmentId,
      patientId: visit.patientId,
      patientName: visit.patientName,
      doctorId: visit.doctorId,
      doctorName: visit.doctorName,
      assistantId: visit.assistantId ?? "",
      assistantName: visit.assistantName ?? "",
      status: visit.status,
      totalAmount: visit.totalAmount,
      confirmedAt: visit.confirmedAt?.toISOString() ?? "",
      confirmedBy: visit.confirmedBy ?? "",
      voidedAt: visit.voidedAt?.toISOString() ?? "",
      voidReason: visit.voidReason ?? "",
      createdAt: visit.createdAt.toISOString(),
      updatedAt: visit.updatedAt.toISOString(),
      treatmentActs: acts.map(this.toTreatmentActReply),
    };
  }

  static toActCatalogReply(item: ActCatalog): TreatmentProto.ActCatalogReply {
    return {
      id: item.id,
      clinicId: item.clinicId,
      code: item.code,
      nameAr: item.nameAr,
      nameFr: item.nameFr,
      nameEn: item.nameEn,
      defaultPrice: item.defaultPrice,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  static toTreatmentActReply(
    act: TreatmentAct,
  ): TreatmentProto.TreatmentActReply {
    return {
      id: act.id,
      clinicId: act.clinicId,
      visitId: act.visitId,
      actCatalogId: act.actCatalogId,
      toothFdi: act.toothFdi ?? "",
      quantity: act.quantity,
      unitPrice: act.unitPrice,
      surface: act.surface ?? "",
      toothPart: act.toothPart ?? "",
      dentition: act.dentition ?? "",
      status: act.status,
      notes: act.notes ?? "",
      enteredBy: act.enteredBy,
      createdAt: act.createdAt.toISOString(),
      updatedAt: act.updatedAt.toISOString(),
    };
  }
}
