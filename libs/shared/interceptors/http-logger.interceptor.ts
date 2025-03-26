import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { WinstonLoggerService } from '../logger/logger.service';
import { Request } from 'express';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();

    this.logger.log(
      `[HTTP] Beérkező kérés ${request.method} ${request.originalUrl}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const responseData = Array.isArray(data)
          ? ''
          : `, response: ${JSON.stringify(data)}`;
        this.logger.log(
          `[HTTP Response] A műveletek sikeresen befejeződtek${responseData}`,
        );
      }),
    );
  }
}
