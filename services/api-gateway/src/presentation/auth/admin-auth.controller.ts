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
import {lastValueFrom} from "rxjs";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {AUTH_GRPC_CLIENT} from "../../infrastructure/grpc/auth-grpc-client.module";
import {AdminLoginDto} from "./dto/admin-login.dto";
import {AdminRegisterDto} from "./dto/admin-register.dto";
import {AuthProto} from "@lib/proto";

type AuthServiceClient = AuthProto.AuthServiceClient;
type AuthReply = AuthProto.AuthReply;
type RefreshTokenReply = AuthProto.RefreshTokenReply;
const AUTH_SERVICE_NAME = AuthProto.AUTH_SERVICE_NAME;

@Controller("auth")
export class AdminAuthController implements OnModuleInit {
  private authGrpcService!: AuthServiceClient;

  constructor(
    @Inject(AUTH_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcService =
      this.grpcClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
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
          clinicId: "",
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("access_token", reply.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", reply.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: reply.accessToken,
      refreshToken: reply.refreshToken,
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
          fullName: dto.fullName,
          role: dto.role,
          clinicId: "",
        }),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }

    return {
      accessToken: reply.accessToken,
      refreshToken: reply.refreshToken,
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
        this.authGrpcService.refreshToken({refreshToken}),
      );
    } catch (err: unknown) {
      this.handleGrpcError(err);
    }

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("access_token", reply.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", reply.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {accessToken: reply.accessToken};
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
    const grpcErr = err as {code?: number; message?: string; details?: string};
    // gRPC-js puts the original message in `details`; `message` is formatted as "<code> STATUS: ..."
    const detail = grpcErr?.details ?? grpcErr?.message;
    if (
      grpcErr?.code === GrpcStatus.UNAUTHENTICATED ||
      grpcErr?.code === GrpcStatus.NOT_FOUND
    ) {
      throw new UnauthorizedException(detail ?? "Invalid credentials");
    }
    if (grpcErr?.code === GrpcStatus.ALREADY_EXISTS) {
      throw new ConflictException(detail ?? "Email already registered");
    }
    if (grpcErr?.code === GrpcStatus.INVALID_ARGUMENT) {
      throw new ConflictException(detail ?? "Invalid request");
    }
    throw new InternalServerErrorException("Auth service unavailable");
  }
}
