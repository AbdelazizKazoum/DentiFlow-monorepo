import axios from "axios";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

export const handleHttpError = (error: unknown): never => {
  if (!axios.isAxiosError(error)) {
    throw new AppError("UNKNOWN_ERROR", "Unexpected error");
  }

  // No response → network issue
  if (!error.response) {
    throw new AppError("NETWORK_ERROR", "Network error");
  }

  const {status, data} = error.response;

  // Optional: backend message
  const serverMessage = data?.message;

  switch (status) {
    case 400:
      throw new AppError(
        "BAD_REQUEST",
        serverMessage || "Invalid request",
        status,
      );

    case 401:
      throw new AppError("UNAUTHORIZED", "You are not authorized", status);

    case 404:
      throw new AppError("NOT_FOUND", "Resource not found", status);

    case 500:
      throw new AppError("SERVER_ERROR", "Server error occurred", status);

    default:
      throw new AppError("UNKNOWN_ERROR", "Something went wrong", status);
  }
};
