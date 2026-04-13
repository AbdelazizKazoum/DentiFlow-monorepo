import {authOptions} from "../nextauth.config";
import type {Credentials} from "next-auth/providers/credentials";

// Mock the use case
jest.mock("@/infrastructure/container", () => ({
  adminLoginUseCase: {
    execute: jest.fn(),
  },
}));

import {adminLoginUseCase} from "@/infrastructure/container";
const mockExecute = adminLoginUseCase.execute as jest.Mock;

describe("NextAuth CredentialsProvider authorize()", () => {
  const credentialsProvider = authOptions.providers[0] as any;
  const authorize = credentialsProvider.authorize;

  it("returns null when credentials are missing", async () => {
    expect(await authorize(null, {} as any)).toBeNull();
    expect(await authorize({email: "", password: ""}, {} as any)).toBeNull();
  });

  it("returns null when use case returns null (invalid credentials)", async () => {
    mockExecute.mockResolvedValue(null);
    const result = await authorize(
      {email: "x@x.com", password: "wrong"},
      {} as any,
    );
    expect(result).toBeNull();
  });

  it("returns user object with required claims when credentials are valid", async () => {
    mockExecute.mockResolvedValue({
      id: "u1",
      firstName: "Amine",
      lastName: "Admin",
      email: "admin@dentiflow.com",
      role: "admin",
    });
    const result = await authorize(
      {email: "admin@dentiflow.com", password: "admin123"},
      {} as any,
    );
    expect(result).toMatchObject({
      id: "u1",
      role: "admin",
      user_id: "u1",
      clinic_id: expect.any(String),
    });
  });
});

describe("NextAuth jwt() callback", () => {
  const jwtCallback = authOptions.callbacks!.jwt!;

  it("embeds claims from user on first sign-in", async () => {
    const token = {sub: "u1"} as any;
    const user = {
      id: "u1",
      role: "doctor",
      clinic_id: "clinic-001",
      user_id: "u1",
    };
    const result = await jwtCallback({
      token,
      user,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });
    expect(result.role).toBe("doctor");
    expect(result.clinic_id).toBe("clinic-001");
    expect(result.user_id).toBe("u1");
  });

  it("passes token through unchanged on subsequent calls (no user)", async () => {
    const token = {
      sub: "u1",
      role: "admin",
      clinic_id: "clinic-001",
      user_id: "u1",
    } as any;
    const result = await jwtCallback({
      token,
      user: undefined as any,
      account: null,
      profile: undefined,
      trigger: "update",
      isNewUser: false,
      session: undefined,
    });
    expect(result.role).toBe("admin");
  });
});

describe("NextAuth session() callback", () => {
  const sessionCallback = authOptions.callbacks!.session!;

  it("maps JWT claims to session.user", async () => {
    const session = {
      user: {name: "Amine", email: "a@a.com"},
      expires: "",
    } as any;
    const token = {
      role: "secretariat",
      clinic_id: "clinic-001",
      user_id: "u2",
    } as any;
    const result = await sessionCallback({
      session,
      token,
      user: undefined as any,
      newSession: undefined,
      trigger: "update",
    });
    expect(result.user.role).toBe("secretariat");
    expect(result.user.clinic_id).toBe("clinic-001");
    expect(result.user.user_id).toBe("u2");
  });
});
