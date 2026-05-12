import {
  Controller,
  ForbiddenException,
  MessageEvent,
  Query,
  Sse,
  UseGuards,
} from "@nestjs/common";
import {interval, map, merge, Observable} from "rxjs";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";
import {QueueEventBroadcaster} from "../../infrastructure/nats/queue-event-broadcaster.service";

@Controller()
export class SseController {
  constructor(private readonly broadcaster: QueueEventBroadcaster) {}

  @UseGuards(JwtAuthGuard)
  @Sse("/events/queue")
  queueEvents(
    @Query("clinicId") clinicId: string,
    @CurrentUser() user: JwtPayload,
  ): Observable<MessageEvent> {
    // clinic_id anti-leak: query param must match token claim
    if (clinicId !== user.clinic_id) {
      throw new ForbiddenException(
        "clinicId does not match authenticated clinic scope",
      );
    }

    return merge(
      this.broadcaster.getStream(clinicId),
      interval(25_000).pipe(map(() => ({data: ":heartbeat"}))),
    );
  }
}
