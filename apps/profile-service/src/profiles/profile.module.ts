import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentEntity } from '../entities/student.entity';
import { NatsLoggerInterceptor, WinstonLoggerService } from '@libs/shared';
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
        entities: [StudentEntity],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([StudentEntity]),
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: NatsLoggerInterceptor,
    },
  ],
})
export class ProfileModule {}
