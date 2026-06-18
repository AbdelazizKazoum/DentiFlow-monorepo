import {Logger} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";

const logger = new Logger("RpcErrorHelper");

export function rethrowAsRpc(err: unknown): never {
  if (err instanceof RpcException) throw err;

  const grpcErr = err as {
    code?: number;
    details?: string;
    status?: number;
    message?: string;
  };
  const message = grpcErr?.details ?? grpcErr?.message ?? "Unknown error";

  if (grpcErr?.code === status.NOT_FOUND || grpcErr?.status === 404) {
    throw new RpcException({code: status.NOT_FOUND, message});
  }
  if (grpcErr?.code === status.ALREADY_EXISTS || grpcErr?.status === 409) {
    throw new RpcException({code: status.ALREADY_EXISTS, message});
  }
  if (grpcErr?.code === status.INVALID_ARGUMENT || grpcErr?.status === 400) {
    throw new RpcException({code: status.INVALID_ARGUMENT, message});
  }

  logger.error(
    `Unhandled error in gRPC handler: ${message}`,
    err instanceof Error ? err.stack : JSON.stringify(err),
  );
  throw new RpcException({code: status.INTERNAL, message: "Internal server error"});
}
