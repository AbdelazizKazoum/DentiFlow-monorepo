import * as Joi from "joi";

export enum NodeEnvironment {
  Development = "development",
  Production = "production",
  Test = "test",
}

/** Shared vars every service needs. */
export const baseSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnvironment))
    .default(NodeEnvironment.Development),
  LOG_LEVEL: Joi.string().default("info"),
  PORT: Joi.number().default(3000),
});

/** Adds JWT vars — for services that sign/verify tokens but have no DB. */
export const jwtSchema = baseSchema.concat(
  Joi.object({
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.number().default(900), // seconds — 15 min
  }),
);

/** Adds refresh-token vars — auth-service only. Do NOT chain into databaseSchema
 *  because clinic-service and other DB services don't use refresh tokens.
 */
export const refreshTokenSchema = jwtSchema.concat(
  Joi.object({
    REFRESH_TOKEN_SECRET: Joi.string().required(),
    REFRESH_TOKEN_EXPIRES_IN: Joi.number().default(604800), // seconds — 7 days
  }),
);

/** Adds DB vars on top of jwtSchema — for services with a database (clinic-service etc.).
 *  Does NOT include refresh-token vars; auth-service adds those separately.
 */
export const databaseSchema = jwtSchema.concat(
  Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  }),
);

/** Full schema for the auth-service: JWT + refresh tokens + DB. */
export const authServiceSchema = refreshTokenSchema.concat(
  Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  }),
);

export type ValidatedEnv = Record<string, unknown>;
