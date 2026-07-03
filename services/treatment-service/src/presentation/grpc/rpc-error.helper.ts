import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {RpcException} from "@nestjs/microservices";

export function toRpcError(err: unknown): never {
  if (err instanceof NotFoundException) {
    throw new RpcException({code: GrpcStatus.NOT_FOUND, message: err.message});
  }
  if (err instanceof ConflictException) {
    throw new RpcException({code: GrpcStatus.ALREADY_EXISTS, message: err.message});
  }
  if (err instanceof BadRequestException) {
    throw new RpcException({code: GrpcStatus.INVALID_ARGUMENT, message: err.message});
  }
  throw err;
}
