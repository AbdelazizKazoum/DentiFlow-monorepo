import "reflect-metadata";
import {DataSource} from "typeorm";
import {PatientTypeOrmEntity} from "./entities/patient.typeorm-entity";
import {InsuranceProviderTypeOrmEntity} from "./entities/insurance-provider.typeorm-entity";
import {InsuranceTemplateTypeOrmEntity} from "./entities/insurance-template.typeorm-entity";
import {PatientInsuranceTypeOrmEntity} from "./entities/patient-insurance.typeorm-entity";
import {PatientDocumentTypeOrmEntity} from "./entities/patient-document.typeorm-entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env["DB_HOST"] ?? "localhost",
  port: Number(process.env["DB_PORT"] ?? 3306),
  username: process.env["DB_USERNAME"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_NAME"],
  entities: [
    PatientTypeOrmEntity,
    InsuranceProviderTypeOrmEntity,
    InsuranceTemplateTypeOrmEntity,
    PatientInsuranceTypeOrmEntity,
    PatientDocumentTypeOrmEntity,
  ],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
  charset: "utf8mb4",
  timezone: "Z",
});
