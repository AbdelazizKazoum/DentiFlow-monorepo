import {Module} from "@nestjs/common";
import * as Joi from "joi";
import {ConfigModule, LoggerModule, DatabaseModule, baseSchema} from "@lib";
import {HealthModule} from "./presentation/health/health.module";
import {PatientModule} from "./patient/patient.module";

const patientEnvSchema = baseSchema.concat(
  Joi.object({
    GRPC_PORT: Joi.number().default(5003),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  }),
);

@Module({
  imports: [
    ConfigModule.forRoot({validationSchema: patientEnvSchema}),
    LoggerModule,
    DatabaseModule.forRoot(),
    PatientModule,
    HealthModule,
  ],
})
export class AppModule {}
