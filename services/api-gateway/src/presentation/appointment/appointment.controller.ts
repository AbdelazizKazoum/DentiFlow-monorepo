import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {Roles} from "../../shared/decorators/roles.decorator";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";
import {UserRole} from "../../domain/auth/enums/user-role.enum";
import {
  APPOINTMENT_GRPC_CLIENT,
  AppointmentServiceClient,
  appointmentToHttp,
  handleGrpcError,
  initAppointmentGrpcService,
  toNumber,
} from "./appointment-grpc.helper";

type AppointmentBody = {
  patient_id?: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_id?: string;
  doctor_name?: string;
  start_at?: string;
  end_at?: string;
  is_emergency?: boolean;
  type?: string;
  channel?: string;
  status?: string;
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
};

@ApiTags("appointments")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, ClinicScopeGuard)
export class AppointmentController implements OnModuleInit {
  private appointmentGrpcService!: AppointmentServiceClient;

  constructor(
    @Inject(APPOINTMENT_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.appointmentGrpcService = initAppointmentGrpcService(this.grpcClient);
  }

  @Get("clinics/:id/appointments")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async listAppointments(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Query()
    query: {
      page?: string;
      limit?: string;
      start_date?: string;
      end_date?: string;
      doctor_id?: string;
      status?: string;
    },
  ) {
    try {
      const result = await lastValueFrom(
        this.appointmentGrpcService.listAppointments({
          clinicId,
          ...(query.page ? {page: toNumber(query.page)} : {}),
          ...(query.limit ? {limit: toNumber(query.limit)} : {}),
          ...(query.start_date ? {startDate: query.start_date} : {}),
          ...(query.end_date ? {endDate: query.end_date} : {}),
          ...(query.doctor_id ? {doctorId: query.doctor_id} : {}),
          ...(query.status ? {status: query.status} : {}),
        }),
      );
      return {
        appointments: (result.appointments ?? []).map(appointmentToHttp),
        total: result.total ?? 0,
      };
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Post("clinics/:id/appointments")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async createAppointment(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Body() body: AppointmentBody,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const appointment = await lastValueFrom(
        this.appointmentGrpcService.createAppointment({
          clinicId,
          patientId: body.patient_id ?? "",
          patientName: body.patient_name ?? "",
          patientPhone: body.patient_phone,
          doctorId: body.doctor_id ?? "",
          doctorName: body.doctor_name ?? "",
          startAt: body.start_at ?? "",
          endAt: body.end_at ?? "",
          isEmergency: body.is_emergency ?? false,
          type: body.type,
          channel: body.channel ?? "PHONE",
          status: body.status,
          notes: body.notes,
          createdBy: user.user_id,
        }),
      );
      return appointmentToHttp(appointment);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Put("clinics/:id/appointments/:appointmentId")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async updateAppointment(
    @Param("id", ParseUUIDPipe) clinicId: string,
    @Param("appointmentId", ParseUUIDPipe) appointmentId: string,
    @Body() body: AppointmentBody,
  ) {
    try {
      await this.assertAppointmentInClinic(appointmentId, clinicId);
      const appointment = await lastValueFrom(
        this.appointmentGrpcService.updateAppointment({
          appointmentId,
          patientId: body.patient_id,
          patientName: body.patient_name,
          patientPhone: body.patient_phone,
          doctorId: body.doctor_id,
          doctorName: body.doctor_name,
          startAt: body.start_at,
          endAt: body.end_at,
          isEmergency: body.is_emergency,
          type: body.type,
          channel: body.channel,
          status: body.status,
          notes: body.notes,
          cancelledAt: body.cancelled_at,
          cancellationReason: body.cancellation_reason,
        }),
      );
      return appointmentToHttp(appointment);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("appointments/conflicts")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async checkConflicts(
    @CurrentUser() user: JwtPayload,
    @Query()
    query: {
      clinic_id?: string;
      doctor_id?: string;
      start_at?: string;
      end_at?: string;
      exclude_status?: string;
      exclude_appointment_id?: string;
    },
  ) {
    try {
      const result = await lastValueFrom(
        this.appointmentGrpcService.checkAppointmentConflicts({
          clinicId: query.clinic_id ?? user.clinic_id,
          doctorId: query.doctor_id ?? "",
          startAt: query.start_at ?? "",
          endAt: query.end_at ?? "",
          excludeStatus: query.exclude_status,
          excludeAppointmentId: query.exclude_appointment_id,
        }),
      );
      return {has_conflict: result.hasConflict};
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Get("appointments/:appointmentId")
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.SECRETARY,
    UserRole.DENTAL_ASSISTANT,
  )
  async getAppointment(
    @Param("appointmentId", ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const appointment = await lastValueFrom(
        this.appointmentGrpcService.getAppointment({id: appointmentId}),
      );
      const httpAppointment = appointmentToHttp(appointment);
      this.assertClinicAccess(httpAppointment.clinic_id, user.clinic_id);
      return httpAppointment;
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  @Patch("appointments/:appointmentId/timing")
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DOCTOR)
  async updateAppointmentTiming(
    @Param("appointmentId", ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      doctor_id?: string;
      doctor_name?: string;
      new_start_at?: string;
      new_end_at?: string;
    },
  ) {
    try {
      await this.assertAppointmentInClinic(appointmentId, user.clinic_id);
      const appointment = await lastValueFrom(
        this.appointmentGrpcService.updateAppointmentTiming({
          appointmentId,
          doctorId: body.doctor_id ?? "",
          doctorName: body.doctor_name,
          newStartAt: body.new_start_at ?? "",
          newEndAt: body.new_end_at ?? "",
        }),
      );
      return appointmentToHttp(appointment);
    } catch (err: unknown) {
      handleGrpcError(err);
    }
  }

  private async assertAppointmentInClinic(
    appointmentId: string,
    clinicId: string,
  ): Promise<void> {
    const appointment = await lastValueFrom(
      this.appointmentGrpcService.getAppointment({id: appointmentId}),
    );
    this.assertClinicAccess(appointment.clinicId, clinicId);
  }

  private assertClinicAccess(
    entityClinicId: string,
    userClinicId: string,
  ): void {
    if (entityClinicId !== userClinicId) {
      throw new ForbiddenException(
        "You do not have access to this clinic's resources",
      );
    }
  }
}
