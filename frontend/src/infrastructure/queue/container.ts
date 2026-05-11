import {CheckInPatientUseCase} from "@/application/queue/useCases/CheckInPatientUseCase";
import {CorrectQueueStatusUseCase} from "@/application/queue/useCases/CorrectQueueStatusUseCase";
import {GetWaitingRoomQueueUseCase} from "@/application/queue/useCases/GetWaitingRoomQueueUseCase";
import {SeatPatientUseCase} from "@/application/queue/useCases/SeatPatientUseCase";
import {UpdateQueueNotesUseCase} from "@/application/queue/useCases/UpdateQueueNotesUseCase";
import {UpdateQueueStatusUseCase} from "@/application/queue/useCases/UpdateQueueStatusUseCase";
import {InMemoryQueueRepository} from "./inMemory/InMemoryQueueRepository";

const queueRepository = new InMemoryQueueRepository();

export const getWaitingRoomQueueUseCase = new GetWaitingRoomQueueUseCase(
  queueRepository,
);
export const checkInPatientUseCase = new CheckInPatientUseCase(queueRepository);
export const updateQueueStatusUseCase = new UpdateQueueStatusUseCase(
  queueRepository,
);
export const correctQueueStatusUseCase = new CorrectQueueStatusUseCase(
  queueRepository,
);
export const seatPatientUseCase = new SeatPatientUseCase(queueRepository);
export const updateQueueNotesUseCase = new UpdateQueueNotesUseCase(
  queueRepository,
);
