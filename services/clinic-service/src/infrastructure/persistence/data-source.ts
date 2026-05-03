/**
 * TypeORM CLI DataSource — used only for migration commands.
 * Copy .env to .env.local (or set env vars) before running.
 *
 * Usage:
 *   pnpm migration:run:clinic-service
 *   pnpm migration:revert:clinic-service
 *   pnpm migration:show:clinic-service
 */
import "reflect-metadata";
import {DataSource} from "typeorm";
import {ClinicTypeOrmEntity} from "./entities/clinic.typeorm-entity";
import {WorkingHoursTypeOrmEntity} from "./entities/working-hours.typeorm-entity";
import {StaffMemberTypeOrmEntity} from "./entities/staff-member.typeorm-entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env["DB_HOST"] ?? "localhost",
  port: Number(process.env["DB_PORT"] ?? 3306),
  username: process.env["DB_USERNAME"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_NAME"],
  entities: [
    ClinicTypeOrmEntity,
    WorkingHoursTypeOrmEntity,
    StaffMemberTypeOrmEntity,
  ],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
  charset: "utf8mb4",
  timezone: "Z",
});
