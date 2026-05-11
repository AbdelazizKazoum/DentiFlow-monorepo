import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {Roles} from "../../shared/decorators/roles.decorator";
import {UserRole} from "../../domain/auth/enums/user-role.enum";
import {
  APPOINTMENT_GRPC_CLIENT,
  AppointmentServiceClient,
  handleGrpcError,
  initAppointmentGrpcService,
  queueEntryToHttp,
} from "./appointment-grpc.helper";

@ApiTags("queue")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class QueueController implements OnModuleInit {
  private appointmentGrpcService!: AppointmentServiceClient;

  constructor(
    @Inject(APPOINTMENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.appointmentGrpcService = initAppointmentGrpcService(this.grpcClient);
  }

  @Get("clinics/:id/queue")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listQueue(@Param("id", ParseUUIDPipe) clinicId: string) {
    try {
      const result = await lastValueFrom(
        this.appointmentGrpcService.listQueueEntries({clinicId}),
      );
      return {queue_entries: result.queueEntries.map(queueEntryToHttp)};
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Post("clinics/:id/queue")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTAL_ASSISTANT)
  async checkIn(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Body()
    body: {
      appointment_id?: string;
      patient_id?: string;
      patient_name?: string;
      patient_phone?: string;
      doctor_id?: string;
      doctor_name?: string;
      appointment_type?: string;
      priority?: string;
      queue_notes?: string;
      arrived_at?: string;
    },
  ) {
    try {
      const entry = await lastValueFrom(
        this.appointmentGrpcService.checkInPatient({
          clinicId,
          appointmentId: body.appointment_id ?? "",
          patientId: body.patient_id ?? "",
          patientName: body.patient_name ?? "",
          patientPhone: body.patient_phone,
          doctorId: body.doctor_id ?? "",
          doctorName: body.doctor_name ?? "",
          appointmentType: body.appointment_type,
          priority: body.priority,
          queueNotes: body.queue_notes,
          arrivedAt: body.arrived_at,
        }),
      );
      return queueEntryToHttp(entry);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("queue/:queueEntryId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getQueueEntry(
    @Param("queueEntryId", ParseUUIDPipe) queueEntryId: string,
  ) {
    try {
      const entry = await lastValueFrom(
        this.appointmentGrpcService.getQueueEntry({id: queueEntryId}),
      );
      return queueEntryToHttp(entry);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("queue/:queueEntryId/status")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTAL_ASSISTANT)
  async updateStatus(
    @Param("queueEntryId", ParseUUIDPipe) queueEntryId: string,
    @Body() body: {status?: string; correction_reason?: string},
  ) {
    try {
      const entry = await lastValueFrom(
        this.appointmentGrpcService.updateQueueStatus({
          queueEntryId,
          status: body.status ?? "",
          correctionReason: body.correction_reason,
        }),
      );
      return queueEntryToHttp(entry);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("queue/:queueEntryId/notes")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTAL_ASSISTANT)
  async updateNotes(
    @Param("queueEntryId", ParseUUIDPipe) queueEntryId: string,
    @Body() body: {queue_notes?: string},
  ) {
    try {
      const entry = await lastValueFrom(
        this.appointmentGrpcService.updateQueueNotes({
          queueEntryId,
          queueNotes: body.queue_notes,
        }),
      );
      return queueEntryToHttp(entry);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }
}
