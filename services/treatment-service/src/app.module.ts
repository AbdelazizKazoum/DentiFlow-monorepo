import {Module} from "@nestjs/common";
import * as Joi from "joi";
import {ConfigModule, DatabaseModule, LoggerModule, baseSchema} from "@lib";
import {TreatmentModule} from "./treatment/treatment.module";
import {HealthModule} from "./presentation/health/health.module";

const treatmentEnvSchema = baseSchema.concat(
  Joi.object({
    GRPC_PORT: Joi.number().default(5005),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_LOGGING: Joi.string().valid("true", "false").default("false"),
    NATS_URL: Joi.string().allow("").optional(),
    OUTBOX_RELAY_INTERVAL_MS: Joi.number().default(500),
  }),
);

@Module({
  imports: [
    ConfigModule.forRoot({validationSchema: treatmentEnvSchema}),
    LoggerModule,
    DatabaseModule.forRoot(),
    TreatmentModule,
    HealthModule,
  ],
})
export class AppModule {}
