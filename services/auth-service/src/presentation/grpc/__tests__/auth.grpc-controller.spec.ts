import {Test, TestingModule} from "@nestjs/testing";
import {RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";
import {AuthGrpcController} from "../auth.grpc-controller";
import {LoginUserUseCase} from "../../../application/use-cases/login-user.use-case";
import {RegisterUserUseCase} from "../../../application/use-cases/register-user.use-case";
import {RefreshTokenUseCase} from "../../../application/use-cases/refresh-token.use-case";
import {REFRESH_TOKEN_USE_CASE} from "../../../shared/constants/injection-tokens";
import {UnauthorizedException} from "@nestjs/common";

describe("AuthGrpcController", () => {
  let controller: AuthGrpcController;
  let mockLoginUseCase: jest.Mocked<LoginUserUseCase>;
  let mockRegisterUseCase: jest.Mocked<RegisterUserUseCase>;
  let mockRefreshUseCase: jest.Mocked<RefreshTokenUseCase>;

  const validAuthResponse = {
    accessToken: "access-token-123",
    refreshToken: "refresh-token-456",
    user: {
      id: "user-1",
      email: "admin@dentiflow.com",
      fullName: "Admin User",
      role: "admin",
      clinicId: "clinic-abc",
    },
  };

  beforeEach(async () => {
    mockLoginUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUserUseCase>;

    mockRegisterUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RegisterUserUseCase>;

    mockRefreshUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthGrpcController],
      providers: [
        {provide: LoginUserUseCase, useValue: mockLoginUseCase},
        {provide: RegisterUserUseCase, useValue: mockRegisterUseCase},
        {provide: REFRESH_TOKEN_USE_CASE, useValue: mockRefreshUseCase},
      ],
    }).compile();

    controller = module.get<AuthGrpcController>(AuthGrpcController);
  });

  describe("Login", () => {
    it("should return AuthReply with access_token, refresh_token, and user on valid credentials", async () => {
      mockLoginUseCase.execute.mockResolvedValue(validAuthResponse);

      const result = await controller.login({
        email: "admin@dentiflow.com",
        password: "correctpassword",
        clinic_id: "",
      });

      expect(result).toEqual({
        access_token: "access-token-123",
        refresh_token: "refresh-token-456",
        user: {
          id: "user-1",
          email: "admin@dentiflow.com",
          full_name: "Admin User",
          role: "admin",
          clinic_id: "clinic-abc",
        },
      });
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        email: "admin@dentiflow.com",
        password: "correctpassword",
        clinicId: "",
      });
    });

    it("should throw RpcException with UNAUTHENTICATED on wrong password", async () => {
      mockLoginUseCase.execute.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(
        controller.login({
          email: "admin@dentiflow.com",
          password: "wrongpassword",
          clinic_id: "",
        }),
      ).rejects.toThrow(RpcException);

      try {
        await controller.login({
          email: "admin@dentiflow.com",
          password: "wrongpassword",
          clinic_id: "",
        });
      } catch (err: unknown) {
        const rpcErr = err as RpcException;
        expect(rpcErr.getError()).toMatchObject({code: status.UNAUTHENTICATED});
      }
    });

    it("should throw RpcException with UNAUTHENTICATED on unknown email", async () => {
      mockLoginUseCase.execute.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(
        controller.login({
          email: "unknown@dentiflow.com",
          password: "anypassword",
          clinic_id: "",
        }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe("RefreshToken", () => {
    it("should return RefreshTokenReply with new access_token and rotated refresh_token on valid token", async () => {
      mockRefreshUseCase.execute.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      const result = await controller.refreshToken({
        refresh_token: "valid-refresh-token",
      });

      expect(result).toEqual({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      });
      expect(mockRefreshUseCase.execute).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
    });

    it("should throw RpcException with UNAUTHENTICATED on expired/invalid refresh token", async () => {
      mockRefreshUseCase.execute.mockRejectedValue(
        new RpcException({
          code: status.UNAUTHENTICATED,
          message: "Invalid or expired refresh token",
        }),
      );

      await expect(
        controller.refreshToken({refresh_token: "expired-token"}),
      ).rejects.toThrow(RpcException);

      try {
        await controller.refreshToken({refresh_token: "expired-token"});
      } catch (err: unknown) {
        const rpcErr = err as RpcException;
        expect(rpcErr.getError()).toMatchObject({code: status.UNAUTHENTICATED});
      }
    });
  });
});
