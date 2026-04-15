import {UnauthorizedException} from "@nestjs/common";
import {LoginUserUseCase} from "./login-user.use-case";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from "bcryptjs";
import {IUserRepository} from "../../domain/repositories/user-repository.interface";
import {IJwtService} from "../ports/jwt-service.interface";
import {User} from "../../domain/entities/user";
import {UserRole} from "../../domain/enums/user-role.enum";

describe("LoginUserUseCase", () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<IJwtService>;

  const validCommand = {
    email: "dr@clinic.com",
    password: "Secure123!",
    clinicId: "clinic-uuid-123",
  };

  const mockUser = new User(
    "user-uuid",
    "clinic-uuid-123",
    "dr@clinic.com",
    // bcrypt hash of "Secure123!" with salt 10 (pre-generated for tests)
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    "Dr. Ahmed",
    UserRole.DOCTOR,
    new Date(),
  );

  beforeEach(() => {
    userRepository = {
      findByEmailAndClinic: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    useCase = new LoginUserUseCase(
      userRepository as unknown as IUserRepository,
      jwtService as unknown as IJwtService,
    );
  });

  it("should return accessToken and user on valid credentials", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockResolvedValue("signed-token");

    const result = await useCase.execute(validCommand);

    expect(result.accessToken).toBe("signed-token");
    expect(result.user).toEqual({
      id: "user-uuid",
      email: "dr@clinic.com",
      fullName: "Dr. Ahmed",
      role: UserRole.DOCTOR,
      clinicId: "clinic-uuid-123",
    });
  });

  it("should throw UnauthorizedException with 'Invalid credentials' on wrong password", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(validCommand)).rejects.toThrow(
      new UnauthorizedException("Invalid credentials"),
    );
  });

  it("should throw UnauthorizedException with 'Invalid credentials' on unknown email (no user enumeration)", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(null);

    await expect(useCase.execute(validCommand)).rejects.toThrow(
      new UnauthorizedException("Invalid credentials"),
    );
  });

  it("should use identical error message for both missing user and wrong password", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(null);
    let missingUserError: Error | undefined;
    try {
      await useCase.execute(validCommand);
    } catch (e) {
      missingUserError = e as Error;
    }

    userRepository.findByEmailAndClinic.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    let wrongPasswordError: Error | undefined;
    try {
      await useCase.execute(validCommand);
    } catch (e) {
      wrongPasswordError = e as Error;
    }

    expect(missingUserError).toBeDefined();
    expect(wrongPasswordError).toBeDefined();
    expect((missingUserError as UnauthorizedException).message).toBe(
      (wrongPasswordError as UnauthorizedException).message,
    );
  });

  it("should not expose passwordHash in the response", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockResolvedValue("signed-token");

    const result = await useCase.execute(validCommand);

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.user).not.toHaveProperty("password_hash");
  });
});
