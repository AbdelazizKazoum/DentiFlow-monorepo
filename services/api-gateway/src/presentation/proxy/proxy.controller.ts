import {Controller, Get, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../../shared/guards/jwt-auth.guard";

/**
 * ProxyController — placeholder routes for downstream services.
 * All routes are JWT-guarded. Actual gRPC proxying is wired in Story 8.5.
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class ProxyController {
  @Get("auth/me")
  authMe(): {message: string} {
    return {message: "auth-service proxy placeholder"};
  }

  @Get("clinics")
  clinics(): {message: string} {
    return {message: "clinic-service proxy placeholder"};
  }
}
