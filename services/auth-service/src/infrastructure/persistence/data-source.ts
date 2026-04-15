/**
 * TypeORM CLI DataSource — used only for migration commands.
 * Load env vars from .env.local or .env before running.
 *
 * Usage:
 *   pnpm migration:run   — apply pending migrations
 *   pnpm migration:revert — revert last migration
 *   pnpm migration:show  — list applied/pending migrations
 *
 * Tip: create an .env file (or .env.local) in services/auth-service/ before
 * running migrations. All DB_* vars must be set.
 */
import "reflect-metadata";
import {DataSource} from "typeorm";
import {UserTypeOrmEntity} from "./entities/user.typeorm-entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env["DB_HOST"] ?? "localhost",
  port: Number(process.env["DB_PORT"] ?? 3306),
  username: process.env["DB_USERNAME"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_NAME"],
  entities: [UserTypeOrmEntity],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
  charset: "utf8mb4",
  timezone: "Z",
});
