import {ConflictException} from "@nestjs/common";
import {RegisterUserUseCase} from "./register-user.use-case";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from "bcryptjs";
import {IUserRepository} from "../../domain/repositories/user-repository.interface";
import {IJwtService} from "../ports/jwt-service.interface";
import {User} from "../../domain/entities/user";
import {UserRole} from "../../domain/enums/user-role.enum";

describe("RegisterUserUseCase", () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<IJwtService>;

  const validCommand = {
    email: "dr@clinic.com",
    password: "Secure123!",
    fullName: "Dr. Ahmed",
    role: UserRole.DOCTOR,
    clinicId: "clinic-uuid-123",
  };

  beforeEach(() => {
    userRepository = {
      findByEmailAndClinic: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByIdGlobal: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      signRefresh: jest.fn(),
      verifyRefresh: jest.fn(),
    };

    useCase = new RegisterUserUseCase(
      userRepository as unknown as IUserRepository,
      jwtService as unknown as IJwtService,
    );
  });

  it("should hash password with bcrypt salt rounds 12", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(null);
    const mockUser = new User(
      "user-uuid",
      validCommand.clinicId,
      validCommand.email,
      "hashed-password",
      validCommand.fullName,
      validCommand.role,
      new Date(),
    );
    userRepository.save.mockResolvedValue(mockUser);
    jwtService.sign.mockResolvedValue("signed-token");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    await useCase.execute(validCommand);

    expect(bcrypt.hash).toHaveBeenCalledWith(validCommand.password, 12);
  });

  it("should throw ConflictException when email is already registered for the clinic", async () => {
    const existingUser = new User(
      "existing-uuid",
      validCommand.clinicId,
      validCommand.email,
      "hashed",
      "Existing User",
      UserRole.DOCTOR,
      new Date(),
    );
    userRepository.findByEmailAndClinic.mockResolvedValue(existingUser);

    await expect(useCase.execute(validCommand)).rejects.toThrow(
      new ConflictException("Email already registered for this clinic"),
    );

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("should not include passwordHash in the response", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(null);
    const mockUser = new User(
      "user-uuid",
      validCommand.clinicId,
      validCommand.email,
      "hashed-password",
      validCommand.fullName,
      validCommand.role,
      new Date(),
    );
    userRepository.save.mockResolvedValue(mockUser);
    jwtService.sign.mockResolvedValue("signed-token");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    const result = await useCase.execute(validCommand);

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.user).not.toHaveProperty("password_hash");
  });

  it("should return accessToken and sanitized user profile", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(null);
    const mockUser = new User(
      "user-uuid",
      validCommand.clinicId,
      validCommand.email,
      "hashed-password",
      validCommand.fullName,
      validCommand.role,
      new Date(),
    );
    userRepository.save.mockResolvedValue(mockUser);
    jwtService.sign.mockResolvedValue("signed-token");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    const result = await useCase.execute(validCommand);

    expect(result.accessToken).toBe("signed-token");
    expect(result.user).toEqual({
      id: "user-uuid",
      email: validCommand.email,
      fullName: validCommand.fullName,
      role: validCommand.role,
      clinicId: validCommand.clinicId,
    });
  });

  it("should sign JWT with user_id, clinic_id, and role claims", async () => {
    userRepository.findByEmailAndClinic.mockResolvedValue(null);
    const mockUser = new User(
      "user-uuid",
      validCommand.clinicId,
      validCommand.email,
      "hashed-password",
      validCommand.fullName,
      validCommand.role,
      new Date(),
    );
    userRepository.save.mockResolvedValue(mockUser);
    jwtService.sign.mockResolvedValue("signed-token");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    await useCase.execute(validCommand);

    expect(jwtService.sign).toHaveBeenCalledWith({
      user_id: "user-uuid",
      clinic_id: validCommand.clinicId,
      role: validCommand.role,
    });
  });
});
