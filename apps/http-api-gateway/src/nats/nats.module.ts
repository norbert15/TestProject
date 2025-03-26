import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVER',
        transport: Transport.NATS,
        options: {
          servers: ['nats://nats_server'],
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
