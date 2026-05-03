import {Module} from "@nestjs/common";
import * as Joi from "joi";
import {ConfigModule, LoggerModule, DatabaseModule, baseSchema} from "@lib";
import {ClinicModule} from "./clinic/clinic.module";
import {HealthModule} from "./presentation/health/health.module";

const clinicEnvSchema = baseSchema.concat(
  Joi.object({
    GRPC_PORT: Joi.number().default(5002),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  }),
);

@Module({
  imports: [
    // MUST be first — provides ConfigService globally
    ConfigModule.forRoot({validationSchema: clinicEnvSchema}),

    // Global structured JSON logger + correlation interceptor
    LoggerModule,

    // TypeORM connection — reads DB_* vars via ConfigService
    DatabaseModule.forRoot(),

    // Feature modules
    ClinicModule,
    HealthModule,
  ],
})
export class AppModule {}
