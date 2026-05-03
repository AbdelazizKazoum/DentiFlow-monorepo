import {join} from "path";

// __dirname at runtime = <service>/dist/lib/proto/
// (rootDir: ".." in both service tsconfigs means lib/ compiles to dist/lib/)
export const AUTH_PROTO_PATH = join(__dirname, "auth.proto");
export const CLINIC_PROTO_PATH = join(__dirname, "clinic.proto");

// Generated TypeScript types from proto files (DO NOT EDIT generated files)
export * as AuthProto from "./auth";
export * as ClinicProto from "./clinic";
