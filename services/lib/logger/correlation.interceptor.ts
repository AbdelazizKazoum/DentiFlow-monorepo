import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {Observable} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {AsyncLocalStorage} from "async_hooks";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CorrelationContext {
  traceId: string;
  clinicId?: string;
  userId?: string;
}

export const correlationStore = new AsyncLocalStorage<CorrelationContext>();

/**
 * CorrelationInterceptor — generates or forwards a traceId per request
 * and stores it in AsyncLocalStorage so AppLogger can read it without
 * threading it through every call.
 *
 * Register globally in each service main.ts:
 *   app.useGlobalInterceptors(app.get(CorrelationInterceptor));
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const rawTraceId = req.headers["x-trace-id"];
    const traceId = UUID_V4_REGEX.test(rawTraceId ?? "")
      ? rawTraceId!
      : uuidv4();

    return new Observable((subscriber) => {
      correlationStore.run({traceId}, () => {
        const subscription = next.handle().subscribe(subscriber);
        subscriber.add(subscription);
      });
    });
  }
}
