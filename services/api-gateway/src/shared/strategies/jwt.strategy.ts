import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import type {Request} from "express";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Try the httpOnly cookie first (browser clients), then the Authorization header (API clients)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req?.cookies as Record<string, string> | undefined)?.[
            "access_token"
          ] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // passport-jwt has already verified the signature and expiry.
    // Guard against partial payloads from misconfigured issuers.
    if (!payload.user_id || !payload.clinic_id || !payload.role) {
      throw new UnauthorizedException(
        "Invalid token payload: missing required claims",
      );
    }
    return payload;
  }
}
