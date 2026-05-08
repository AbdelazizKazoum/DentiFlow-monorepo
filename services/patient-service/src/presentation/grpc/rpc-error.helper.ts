import {RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";

export function rethrowAsRpc(err: unknown): never {
  if (err instanceof RpcException) throw err;

  const httpErr = err as {status?: number; message?: string};
  const httpStatus = httpErr?.status;
  const message = httpErr?.message ?? "Unknown error";

  if (httpStatus === 409)
    throw new RpcException({code: status.ALREADY_EXISTS, message});
  if (httpStatus === 404)
    throw new RpcException({code: status.NOT_FOUND, message});
  if (httpStatus === 400)
    throw new RpcException({code: status.INVALID_ARGUMENT, message});

  throw new RpcException({
    code: status.INTERNAL,
    message: "Internal server error",
  });
}
