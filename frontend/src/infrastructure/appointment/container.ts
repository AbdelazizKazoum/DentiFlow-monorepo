import {CreateAppointmentUseCase} from "@/application/appointment/useCases/CreateAppointmentUseCase";
import {GetCalendarViewUseCase} from "@/application/appointment/useCases/GetCalendarViewUseCase";
import {GetPaginatedAppointmentsUseCase} from "@/application/appointment/useCases/GetPaginatedAppointmentsUseCase";
import {MoveAppointmentUseCase} from "@/application/appointment/useCases/MoveAppointmentUseCase";
import {UpdateAppointmentUseCase} from "@/application/appointment/useCases/UpdateAppointmentUseCase";
import {AppointmentHttpRepository} from "./repositories/appointment.repository";

const appointmentRepository = new AppointmentHttpRepository();

export const getCalendarViewUseCase = new GetCalendarViewUseCase(
  appointmentRepository,
);
export const getPaginatedAppointmentsUseCase =
  new GetPaginatedAppointmentsUseCase(appointmentRepository);
export const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
);
export const moveAppointmentUseCase = new MoveAppointmentUseCase(
  appointmentRepository,
);
export const updateAppointmentUseCase = new UpdateAppointmentUseCase(
  appointmentRepository,
);
