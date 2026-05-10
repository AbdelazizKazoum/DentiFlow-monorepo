import {CreateAppointmentUseCase} from "@/application/appointment/useCases/CreateAppointmentUseCase";
import {GetCalendarViewUseCase} from "@/application/appointment/useCases/GetCalendarViewUseCase";
import {GetPaginatedAppointmentsUseCase} from "@/application/appointment/useCases/GetPaginatedAppointmentsUseCase";
import {MoveAppointmentUseCase} from "@/application/appointment/useCases/MoveAppointmentUseCase";
import {UpdateAppointmentUseCase} from "@/application/appointment/useCases/UpdateAppointmentUseCase";
import {InMemoryAppointmentRepository} from "./inMemory/InMemoryAppointmentRepository";

const appointmentRepository = new InMemoryAppointmentRepository();

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
