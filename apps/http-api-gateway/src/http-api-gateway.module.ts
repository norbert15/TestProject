import { Module } from '@nestjs/common';
import { ProfileModule } from './controllers/profile/profile.module';
import { AddressModule } from './controllers/address/address.module';
import { NatsModule } from './nats/nats.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CatchEverythingFilter } from './exceptions/exception.filter';
import { HttpLoggerInterceptor, WinstonLoggerService } from '@libs/shared';
import { AuthModule } from './controllers/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ProfileModule,
    AddressModule,
    NatsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    WinstonLoggerService,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
  ],
})
export class HttpApiGatewayModule {}
