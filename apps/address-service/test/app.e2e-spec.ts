import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from '../src/address.service';
import { AddressEntity } from '../src/entities/address.entity';
import { randomUUID } from 'crypto';

jest.setTimeout(50000);

describe('AddressMicroService (e2e)', () => {
  let app: INestApplication;
  let addressService: AddressService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
      providers: [AddressService],
    }).compile();

    app = moduleFixture.createNestApplication();
    addressService = app.get<AddressService>(AddressService);
    await app.init();
  });

  it('should create 10 000 address and measure execution time', async () => {
    const started = new Date();
    const max = 10000;

    const entities: Partial<AddressEntity>[] = [];

    for (let i = 0; i < max; i++) {
      entities.push({
        address: addressService.getRandomAddress(),
        id: randomUUID(),
      });
    }
    console.log('Inserting 10 000 addresses...');
    const results = await addressService.insertBulk(
      entities as AddressEntity[],
    );

    const ended = new Date();
    console.log('Started: ', formatDate(started));
    console.log('Ended: ', formatDate(ended));

    expect(results.identifiers.length).toBe(max);
  });

  afterAll(async () => {
    await app.close();
  });
});

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}
