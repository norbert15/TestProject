import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AddressModule } from './address.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AddressModule,
    {
      transport: Transport.NATS,
      options: {
        servers: 'nats://nats_server',
      },
    },
  );

  await app.listen();
}
bootstrap();
