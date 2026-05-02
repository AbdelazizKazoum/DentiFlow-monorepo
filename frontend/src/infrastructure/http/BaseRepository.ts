import {handleHttpError} from "./httpErrorHandler";

export abstract class BaseRepository {
  protected async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      handleHttpError(error);
      // This line is unreachable since handleHttpError throws, but TypeScript needs it
      throw error;
    }
  }
}
