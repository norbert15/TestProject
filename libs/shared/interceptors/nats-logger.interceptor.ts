import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WinstonLoggerService } from '../logger/logger.service';
import { Observable, tap } from 'rxjs';
import { NatsContext } from '@nestjs/microservices';

@Injectable()
export class NatsLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToRpc().getContext<NatsContext>();
    const subject = ctx.getSubject();
    const payload = context.switchToRpc().getData();

    this.logger.log(`(NATS) Üzenet érkezett a(z) "${subject}" címre!`);

    // Ha a címre érkezet be adat
    if (payload) {
      this.logger.log(`(NATS) Payload: ${JSON.stringify(payload)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        // A listák kiiratásának elkerülése, mivel a lekérdezett listák nagyok is lehetnek így a log fájokat ne terheljük ezzel
        const strData = Array.isArray(data) ? '' : JSON.stringify(data);
        this.logger.log(`(NATS) Válasz vissza küldve! ${strData}`);
      }),
    );
  }
}
