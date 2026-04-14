import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from '../../domain/auth/entities/jwt-payload.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockPayload: JwtPayload = {
    user_id: 'user-123',
    clinic_id: 'clinic-456',
    role: 'dentist',
    iat: 1700000000,
    exp: 1700000900,
  };

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('handleRequest returns user when err is null and user is valid', () => {
    const result = guard.handleRequest(null, mockPayload);
    expect(result).toBe(mockPayload);
  });

  it('handleRequest throws UnauthorizedException when user is false', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('handleRequest throws UnauthorizedException when err is provided', () => {
    expect(() => guard.handleRequest(new Error('JWT error'), null)).toThrow(
      UnauthorizedException,
    );
  });

  it('handleRequest throws clean UnauthorizedException without stack leakage', () => {
    try {
      guard.handleRequest(new Error('internal jwt error'), null);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as UnauthorizedException).message).toBe(
        'Invalid or missing authentication token',
      );
    }
  });
});
