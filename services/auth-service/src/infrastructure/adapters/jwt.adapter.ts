import {Inject, Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {IJwtService} from "../../application/ports/jwt-service.interface";

export const REFRESH_JWT_SERVICE = "REFRESH_JWT_SERVICE";

@Injectable()
export class JwtAdapter implements IJwtService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(REFRESH_JWT_SERVICE)
    private readonly refreshJwtService: JwtService,
  ) {}

  sign(payload: {
    user_id: string;
    clinic_id: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  signRefresh(payload: {user_id: string}): Promise<string> {
    return this.refreshJwtService.signAsync(payload);
  }

  async verifyRefresh(token: string): Promise<{user_id: string}> {
    try {
      return await this.refreshJwtService.verifyAsync<{user_id: string}>(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }
}
