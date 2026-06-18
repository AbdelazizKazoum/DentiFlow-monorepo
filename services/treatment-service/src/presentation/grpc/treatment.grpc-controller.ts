import {Controller, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {TreatmentProto} from "@lib/proto";
import {ManageActCatalogUseCase} from "../../application/use-cases/manage-act-catalog.use-case";
import {ManageTreatmentActsUseCase} from "../../application/use-cases/manage-treatment-acts.use-case";
import {ManageVisitsUseCase} from "../../application/use-cases/manage-visits.use-case";
import {Dentition} from "../../domain/enums/dentition.enum";
import {ToothPart} from "../../domain/enums/tooth-part.enum";
import {ToothSurface} from "../../domain/enums/tooth-surface.enum";
import {TreatmentActStatus} from "../../domain/enums/treatment-act-status.enum";
import {TreatmentGrpcMapper} from "./treatment.grpc-mapper";
import {rethrowAsRpc} from "./rpc-error.helper";

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class TreatmentGrpcController {
  constructor(
    private readonly catalogUC: ManageActCatalogUseCase,
    private readonly visitsUC: ManageVisitsUseCase,
    private readonly actsUC: ManageTreatmentActsUseCase,
  ) {}

  @GrpcMethod("TreatmentService", "GetVisit")
  async getVisit(data: TreatmentProto.GetVisitRequest) {
    try {
      const visit = await this.visitsUC.getById(data.id);
      const acts = await this.actsUC.listByVisit(data.id);
      return TreatmentGrpcMapper.toVisitReply(visit, acts);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "GetVisitByAppointment")
  async getVisitByAppointment(
    data: TreatmentProto.GetVisitByAppointmentRequest,
  ): Promise<TreatmentProto.NullableVisitReply> {
    try {
      const visit = await this.visitsUC.getByAppointment(data.appointmentId);
      if (!visit) return {};
      const acts = await this.actsUC.listByVisit(visit.id);
      return {visit: TreatmentGrpcMapper.toVisitReply(visit, acts)};
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "ListOpenVisits")
  async listOpenVisits(
    data: TreatmentProto.ListOpenVisitsRequest,
  ): Promise<TreatmentProto.VisitsListReply> {
    try {
      const visits = await this.visitsUC.listOpenByClinic(
        data.clinicId,
        data.doctorId || undefined,
      );
      return {
        visits: visits.map((visit) => TreatmentGrpcMapper.toVisitReply(visit)),
        total: visits.length,
      };
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "OpenVisit")
  async openVisit(data: TreatmentProto.OpenVisitRequest) {
    try {
      const visit = await this.visitsUC.open({
        clinicId: data.clinicId,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        patientName: data.patientName,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
      });
      return TreatmentGrpcMapper.toVisitReply(visit);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "AssignAssistant")
  async assignAssistant(data: TreatmentProto.AssignAssistantRequest) {
    try {
      const visit = await this.visitsUC.assignAssistant(
        data.visitId,
        data.assistantId,
        data.assistantName,
      );
      return TreatmentGrpcMapper.toVisitReply(visit);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "ConfirmVisit")
  async confirmVisit(data: TreatmentProto.ConfirmVisitRequest) {
    try {
      const visit = await this.visitsUC.confirm(data.visitId, data.confirmedBy);
      return TreatmentGrpcMapper.toVisitReply(visit);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "CloseVisit")
  async closeVisit(data: TreatmentProto.CloseVisitRequest) {
    try {
      const visit = await this.visitsUC.close(data.visitId);
      return TreatmentGrpcMapper.toVisitReply(visit);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "VoidVisit")
  async voidVisit(data: TreatmentProto.VoidVisitRequest) {
    try {
      const visit = await this.visitsUC.void(data.visitId, data.reason);
      return TreatmentGrpcMapper.toVisitReply(visit);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "ListActCatalog")
  async listActCatalog(
    data: TreatmentProto.ListActCatalogRequest,
  ): Promise<TreatmentProto.ActCatalogListReply> {
    try {
      const result = await this.catalogUC.list({
        clinicId: data.clinicId,
        page: data.page,
        limit: data.limit,
      });
      return {
        items: result.items.map(TreatmentGrpcMapper.toActCatalogReply),
        total: result.total,
      };
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "GetActCatalog")
  async getActCatalog(data: TreatmentProto.GetActCatalogRequest) {
    try {
      const item = await this.catalogUC.getById(data.id);
      return TreatmentGrpcMapper.toActCatalogReply(item);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "CreateActCatalog")
  async createActCatalog(data: TreatmentProto.CreateActCatalogRequest) {
    try {
      const item = await this.catalogUC.create({
        clinicId: data.clinicId,
        code: data.code,
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        defaultPrice: data.defaultPrice,
        isActive: data.isActive ?? true,
      });
      return TreatmentGrpcMapper.toActCatalogReply(item);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "UpdateActCatalog")
  async updateActCatalog(data: TreatmentProto.UpdateActCatalogRequest) {
    try {
      const item = await this.catalogUC.update(data.id, {
        code: data.code || undefined,
        nameAr: data.nameAr || undefined,
        nameFr: data.nameFr || undefined,
        nameEn: data.nameEn || undefined,
        defaultPrice: data.defaultPrice,
        isActive: data.isActive,
      });
      return TreatmentGrpcMapper.toActCatalogReply(item);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "DeleteActCatalog")
  async deleteActCatalog(data: TreatmentProto.DeleteActCatalogRequest) {
    try {
      await this.catalogUC.delete(data.id);
      return {};
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "ListTreatmentActs")
  async listTreatmentActs(
    data: TreatmentProto.ListTreatmentActsRequest,
  ): Promise<TreatmentProto.TreatmentActListReply> {
    try {
      const acts = await this.actsUC.listByVisit(data.visitId);
      return {
        treatmentActs: acts.map(TreatmentGrpcMapper.toTreatmentActReply),
        total: acts.length,
      };
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "GetTreatmentAct")
  async getTreatmentAct(data: TreatmentProto.GetTreatmentActRequest) {
    try {
      const act = await this.actsUC.getById(data.id);
      return TreatmentGrpcMapper.toTreatmentActReply(act);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "AddTreatmentAct")
  async addTreatmentAct(data: TreatmentProto.AddTreatmentActRequest) {
    try {
      const act = await this.actsUC.add({
        clinicId: data.clinicId,
        visitId: data.visitId,
        actCatalogId: data.actCatalogId,
        toothFdi: data.toothFdi || null,
        quantity: data.quantity || undefined,
        surface: data.surface ? (data.surface as ToothSurface) : null,
        toothPart: data.toothPart ? (data.toothPart as ToothPart) : null,
        dentition: data.dentition ? (data.dentition as Dentition) : null,
        status: data.status
          ? (data.status as TreatmentActStatus)
          : TreatmentActStatus.PLANNED,
        notes: data.notes ?? null,
        enteredBy: data.enteredBy,
      });
      return TreatmentGrpcMapper.toTreatmentActReply(act);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "UpdateTreatmentAct")
  async updateTreatmentAct(data: TreatmentProto.UpdateTreatmentActRequest) {
    try {
      const act = await this.actsUC.update(data.id, {
        toothFdi: data.toothFdi ?? undefined,
        quantity: data.quantity,
        surface: data.surface ? (data.surface as ToothSurface) : undefined,
        toothPart: data.toothPart ? (data.toothPart as ToothPart) : undefined,
        dentition: data.dentition ? (data.dentition as Dentition) : undefined,
        status: data.status ? (data.status as TreatmentActStatus) : undefined,
        notes: data.notes ?? undefined,
      });
      return TreatmentGrpcMapper.toTreatmentActReply(act);
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "RemoveTreatmentAct")
  async removeTreatmentAct(data: TreatmentProto.RemoveTreatmentActRequest) {
    try {
      await this.actsUC.remove(data.id);
      return {};
    } catch (error) {
      rethrowAsRpc(error);
    }
  }

  @GrpcMethod("TreatmentService", "CalculateVisitTotal")
  async calculateVisitTotal(
    data: TreatmentProto.CalculateVisitTotalRequest,
  ): Promise<TreatmentProto.VisitTotalReply> {
    try {
      return {totalAmount: await this.actsUC.calculateVisitTotal(data.visitId)};
    } catch (error) {
      rethrowAsRpc(error);
    }
  }
}
