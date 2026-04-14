import { validateGatewayEnv, NodeEnvironment } from './env.validation';

describe('validateGatewayEnv', () => {
  it('throws when JWT_SECRET is missing', () => {
    expect(() => validateGatewayEnv({})).toThrow(
      'Gateway environment validation failed',
    );
  });

  it('throws when JWT_SECRET is an empty string', () => {
    expect(() => validateGatewayEnv({ JWT_SECRET: '' })).toThrow(
      'Gateway environment validation failed',
    );
  });

  it('resolves with defaults when only JWT_SECRET is provided', () => {
    const result = validateGatewayEnv({ JWT_SECRET: 'super-secret' });
    expect(result.JWT_SECRET).toBe('super-secret');
    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe(NodeEnvironment.Development);
    expect(result.LOG_LEVEL).toBe('info');
    expect(result.JWT_EXPIRES_IN).toBe(900);
  });

  it('does NOT require DB_HOST, DB_USERNAME, DB_PASSWORD, or DB_NAME', () => {
    // None of these DB vars should be required — gateway has no database
    expect(() =>
      validateGatewayEnv({
        JWT_SECRET: 'secret',
        // DB vars intentionally absent
      }),
    ).not.toThrow();
  });

  it('accepts valid full configuration', () => {
    const result = validateGatewayEnv({
      JWT_SECRET: 'my-secret',
      PORT: '4000',
      NODE_ENV: 'production',
      LOG_LEVEL: 'debug',
      JWT_EXPIRES_IN: '1800',
      AUTH_SERVICE_URL: 'http://auth:3001',
      CLINIC_SERVICE_URL: 'http://clinic:3002',
    });
    expect(result.PORT).toBe(4000);
    expect(result.NODE_ENV).toBe(NodeEnvironment.Production);
    expect(result.LOG_LEVEL).toBe('debug');
    expect(result.JWT_EXPIRES_IN).toBe(1800);
  });
});
