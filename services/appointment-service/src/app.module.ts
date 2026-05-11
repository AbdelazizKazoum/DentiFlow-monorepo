import {Module} from "@nestjs/common";
import * as Joi from "joi";
import {ConfigModule, DatabaseModule, LoggerModule, baseSchema} from "@lib";
import {AppointmentModule} from "./appointment/appointment.module";
import {HealthModule} from "./presentation/health/health.module";

const appointmentEnvSchema = baseSchema.concat(
  Joi.object({
    GRPC_PORT: Joi.number().default(5004),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    PATIENT_SERVICE_GRPC_URL: Joi.string().default("localhost:5003"),
    CLINIC_SERVICE_GRPC_URL: Joi.string().default("localhost:5002"),
    NATS_URL: Joi.string().allow("").optional(),
    OUTBOX_RELAY_INTERVAL_MS: Joi.number().default(2000),
  }),
);

@Module({
  imports: [
    ConfigModule.forRoot({validationSchema: appointmentEnvSchema}),
    LoggerModule,
    DatabaseModule.forRoot(),
    AppointmentModule,
    HealthModule,
  ],
})
export class AppModule {}
