import {
  Controller,
  ForbiddenException,
  MessageEvent,
  Query,
  Sse,
  UseGuards,
} from "@nestjs/common";
import {Observable, EMPTY} from "rxjs";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

@Controller()
export class SseController {
  /**
   * SSE queue event stream.
   * clinicId query param MUST match the JWT clinic_id claim.
   * NATS subscription is wired in Story 8.5; returns EMPTY for now.
   */
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
    // Stub: NATS subscription to queue.status.updated added in Story 8.5
    return EMPTY;
  }
}
