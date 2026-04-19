import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  OnModuleInit,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {Request, Response} from "express";
import {lastValueFrom, Observable} from "rxjs";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {AUTH_GRPC_CLIENT} from "../../infrastructure/grpc/auth-grpc-client.module";
import {AdminLoginDto} from "./dto/admin-login.dto";
import {AdminRegisterDto} from "./dto/admin-register.dto";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  clinic_id: string;
}

interface AuthReply {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

interface RefreshTokenReply {
  access_token: string;
  refresh_token: string;
}

interface AuthGrpcService {
  login(data: {
    email: string;
    password: string;
    clinic_id: string;
  }): Observable<AuthReply>;
  register(data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    clinic_id: string;
  }): Observable<AuthReply>;
  refreshToken(data: {refresh_token: string}): Observable<RefreshTokenReply>;
}

@Controller("auth")
export class AdminAuthController implements OnModuleInit {
  private authGrpcService!: AuthGrpcService;

  constructor(
    @Inject(AUTH_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcService =
      this.grpcClient.getService<AuthGrpcService>("AuthService");
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AdminLoginDto,
    @Res({passthrough: true}) res: Response,
  ) {
    let reply: AuthReply;
    try {
      reply = await lastValueFrom(
        this.authGrpcService.login({
          email: dto.email,
          password: dto.password,
          clinic_id: "",
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("access_token", reply.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", reply.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: reply.access_token,
      refreshToken: reply.refresh_token,
      user: reply.user,
    };
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: AdminRegisterDto) {
    let reply: AuthReply;
    try {
      reply = await lastValueFrom(
        this.authGrpcService.register({
          email: dto.email,
          password: dto.password,
          full_name: dto.fullName,
          role: dto.role,
          clinic_id: "",
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }

    return {
      accessToken: reply.access_token,
      refreshToken: reply.refresh_token,
      user: reply.user,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const refreshToken: string | undefined =
      (req.cookies as Record<string, string> | undefined)?.["refresh_token"] ??
      req.headers.authorization?.replace("Bearer ", "");

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    let reply: RefreshTokenReply;
    try {
      reply = await lastValueFrom(
        this.authGrpcService.refreshToken({refresh_token: refreshToken}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("access_token", reply.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", reply.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {accessToken: reply.access_token};
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Res({passthrough: true}) res: Response) {
    res.clearCookie("access_token", {httpOnly: true, path: "/"});
    res.clearCookie("refresh_token", {
      httpOnly: true,
      path: "/api/v1/auth/refresh",
    });
    return {message: "Logged out"};
  }

  private handleGrpcError(err: unknown): never {
    const grpcErr = err as {code?: number; message?: string};
    if (
      grpcErr?.code === GrpcStatus.UNAUTHENTICATED ||
      grpcErr?.code === GrpcStatus.NOT_FOUND
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }
    if (grpcErr?.code === GrpcStatus.ALREADY_EXISTS) {
      throw new ConflictException("Email already registered");
    }
    throw new InternalServerErrorException("Auth service unavailable");
  }
}
