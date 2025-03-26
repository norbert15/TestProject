import { WinstonLoggerService } from '@libs/shared';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: WinstonLoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message:
        exception?.response?.message ??
        exception?.message ??
        'Internal Server Error',
    };

    this.logger.error(
      `${responseBody.path} - ${responseBody.statusCode}`,
      exception,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
