import {Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {RegisterUserUseCase} from "../../application/use-cases/register-user.use-case";
import {LoginUserUseCase} from "../../application/use-cases/login-user.use-case";
import {RegisterUserDto} from "../dto/register-user.dto";
import {LoginUserDto} from "../dto/login-user.dto";
import {AuthResponseDto} from "../dto/auth-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.registerUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      role: dto.role,
      clinicId: dto.clinicId ?? "",
    });
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      clinicId: dto.clinicId ?? "",
    });
  }
}
