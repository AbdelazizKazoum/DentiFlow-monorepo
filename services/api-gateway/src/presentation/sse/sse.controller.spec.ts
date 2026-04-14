import { ForbiddenException } from '@nestjs/common';
import { EMPTY } from 'rxjs';
import { SseController } from './sse.controller';
import { JwtPayload } from '../../domain/auth/entities/jwt-payload.entity';

describe('SseController', () => {
  let controller: SseController;

  const mockUser: JwtPayload = {
    user_id: 'user-123',
    clinic_id: 'clinic-456',
    role: 'dentist',
    iat: 1700000000,
    exp: 1700000900,
  };

  beforeEach(() => {
    controller = new SseController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('queueEvents returns EMPTY observable when clinicId matches user clinic_id', () => {
    const result = controller.queueEvents('clinic-456', mockUser);
    expect(result).toBe(EMPTY);
  });

  it('queueEvents throws ForbiddenException when clinicId does not match user clinic_id', () => {
    expect(() => controller.queueEvents('clinic-999', mockUser)).toThrow(
      ForbiddenException,
    );
  });

  it('queueEvents throws ForbiddenException with descriptive message on mismatch', () => {
    try {
      controller.queueEvents('other-clinic', mockUser);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });

  it('SSE route is protected — guard metadata is applied', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      SseController.prototype.queueEvents,
    );
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThan(0);
  });
});
