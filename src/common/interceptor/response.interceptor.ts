import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const handlerPipe = next.handle().pipe(
      map((data) => {
        return {
          code: 200,
          msg: "ok",
          data,
        };
      }),
    );
    return handlerPipe;
  }
}
