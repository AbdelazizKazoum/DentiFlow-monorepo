import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {IJwtService} from "../../application/ports/jwt-service.interface";

@Injectable()
export class JwtAdapter implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: {
    user_id: string;
    clinic_id: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
