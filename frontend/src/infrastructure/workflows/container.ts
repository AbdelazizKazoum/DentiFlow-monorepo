import {CorrectQueueStatusWithVisitUseCase} from "@/application/workflows/useCases/CorrectQueueStatusWithVisitUseCase";
import {SeatPatientAndOpenVisitUseCase} from "@/application/workflows/useCases/SeatPatientAndOpenVisitUseCase";
import {queueRepository} from "@/infrastructure/queue/container";
import {
  treatmentActRepository,
  visitRepository,
} from "@/infrastructure/treatment/container";

export const seatPatientAndOpenVisitUseCase =
  new SeatPatientAndOpenVisitUseCase(queueRepository, visitRepository);

export const correctQueueStatusWithVisitUseCase =
  new CorrectQueueStatusWithVisitUseCase(
    queueRepository,
    visitRepository,
    treatmentActRepository,
  );
