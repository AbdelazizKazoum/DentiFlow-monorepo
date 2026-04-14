import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../../domain/auth/entities/jwt-payload.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockPayload: JwtPayload = {
    user_id: 'user-123',
    clinic_id: 'clinic-456',
    role: 'dentist',
    iat: 1700000000,
    exp: 1700000900,
  };

  beforeEach(() => {
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(mockConfigService);
  });

  it('should be instantiated with correct options', () => {
    expect(strategy).toBeDefined();
  });

  it('validate() returns the payload unchanged', () => {
    const result = strategy.validate(mockPayload);
    expect(result).toBe(mockPayload);
  });

  it('validate() returns all expected JWT fields', () => {
    const result = strategy.validate(mockPayload);
    expect(result.user_id).toBe('user-123');
    expect(result.clinic_id).toBe('clinic-456');
    expect(result.role).toBe('dentist');
    expect(result.iat).toBe(1700000000);
    expect(result.exp).toBe(1700000900);
  });
});
