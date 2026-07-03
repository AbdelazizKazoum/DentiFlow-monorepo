import "reflect-metadata";
import * as dotenv from "dotenv";
import * as path from "path";
import {DataSource} from "typeorm";
import {
  ClinicalAttachmentTypeOrmEntity,
  DiagnosisTypeOrmEntity,
  FollowUpRequestTypeOrmEntity,
  MedicalDocumentRequestTypeOrmEntity,
  OutboxTypeOrmEntity,
  TreatmentActTypeOrmEntity,
  TreatmentChargeTypeOrmEntity,
  TreatmentGroupTypeOrmEntity,
  TreatmentPlanItemTypeOrmEntity,
  VisitHandoffTypeOrmEntity,
  VisitProcedureTypeOrmEntity,
  VisitTypeOrmEntity,
} from "./entities/treatment.typeorm-entities";

dotenv.config({path: path.join(__dirname, "../../../.env")});

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env["DB_HOST"] ?? "localhost",
  port: Number(process.env["DB_PORT"] ?? 3306),
  username: process.env["DB_USERNAME"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_NAME"],
  entities: [
    TreatmentActTypeOrmEntity,
    VisitTypeOrmEntity,
    TreatmentGroupTypeOrmEntity,
    TreatmentPlanItemTypeOrmEntity,
    VisitProcedureTypeOrmEntity,
    DiagnosisTypeOrmEntity,
    ClinicalAttachmentTypeOrmEntity,
    VisitHandoffTypeOrmEntity,
    TreatmentChargeTypeOrmEntity,
    FollowUpRequestTypeOrmEntity,
    MedicalDocumentRequestTypeOrmEntity,
    OutboxTypeOrmEntity,
  ],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
  charset: "utf8mb4",
  timezone: "Z",
});
