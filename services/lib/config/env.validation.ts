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

/** Adds DB vars on top of JWT — for services with a database. */
export const databaseSchema = jwtSchema.concat(
  Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  }),
);

export type ValidatedEnv = Record<string, unknown>;
