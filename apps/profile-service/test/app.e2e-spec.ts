import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../src/profiles/profile.service';
import { ProfileModule } from '../src/profiles/profile.module';
import { CreateStudentDto, StudentDto } from '@libs/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from '../src/entities/student.entity';
import { randomUUID } from 'crypto';

jest.setTimeout(50000);

describe('ProfileMicroService (e2e)', () => {
  let app: INestApplication;
  let profileService: ProfileService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ProfileModule,
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
      providers: [ProfileService],
    }).compile();

    app = moduleFixture.createNestApplication();
    profileService = app.get<ProfileService>(ProfileService);
    await app.init();
  });

  it('should create 10 000 students and measure execution time', async () => {
    const started = new Date();
    const max = 10000;

    const entities: Partial<StudentEntity>[] = [];

    for (let i = 0; i < max; i++) {
      entities.push({
        email: 'nagy.lajos@gmail.com',
        name: 'Nagy Lajos ' + (i + 1),
        id: randomUUID(),
      });
    }

    console.log('Inserting 10 000 students...');
    const results = await profileService.insertBulk(
      entities as StudentEntity[],
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
