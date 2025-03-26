import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';
import { NatsLoggerInterceptor, WinstonLoggerService } from '@libs/shared';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: false,
        entities: [AddressEntity],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AddressEntity]),
  ],
  controllers: [AddressController],
  providers: [
    AddressService,
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: NatsLoggerInterceptor,
    },
  ],
})
export class AddressModule {}
