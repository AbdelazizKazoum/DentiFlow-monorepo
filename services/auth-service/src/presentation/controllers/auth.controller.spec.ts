import {ConflictException, UnauthorizedException} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AuthController} from "./auth.controller";
import {RegisterUserUseCase} from "../../application/use-cases/register-user.use-case";
import {LoginUserUseCase} from "../../application/use-cases/login-user.use-case";
import {UserRole} from "../../domain/enums/user-role.enum";

describe("AuthController", () => {
  let controller: AuthController;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>;

  const mockAuthResponse = {
    accessToken: "signed-token",
    refreshToken: "refresh-token",
    user: {
      id: "user-uuid",
      email: "dr@clinic.com",
      fullName: "Dr. Ahmed",
      role: UserRole.DOCTOR,
      clinicId: "clinic-uuid-123",
    },
  };

  beforeEach(async () => {
    const registerMock = {execute: jest.fn()};
    const loginMock = {execute: jest.fn()};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {provide: RegisterUserUseCase, useValue: registerMock},
        {provide: LoginUserUseCase, useValue: loginMock},
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUserUseCase = module.get(RegisterUserUseCase);
    loginUserUseCase = module.get(LoginUserUseCase);
  });

  describe("POST /auth/register", () => {
    const registerDto = {
      email: "dr@clinic.com",
      password: "Secure123!",
      fullName: "Dr. Ahmed",
      role: UserRole.DOCTOR,
      clinicId: "clinic-uuid-123",
    };

    it("should delegate to RegisterUserUseCase and return the result", async () => {
      registerUserUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(registerUserUseCase.execute).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        fullName: registerDto.fullName,
        role: registerDto.role,
        clinicId: registerDto.clinicId,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it("should propagate ConflictException (409) from use case", async () => {
      registerUserUseCase.execute.mockRejectedValue(
        new ConflictException("Email already registered for this clinic"),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("POST /auth/login", () => {
    const loginDto = {
      email: "dr@clinic.com",
      password: "Secure123!",
      clinicId: "clinic-uuid-123",
    };

    it("should delegate to LoginUserUseCase and return the result", async () => {
      loginUserUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(loginUserUseCase.execute).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
        clinicId: loginDto.clinicId,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it("should propagate UnauthorizedException (401) from use case", async () => {
      loginUserUseCase.execute.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
