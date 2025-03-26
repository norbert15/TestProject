import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HttpApiGatewayModule } from './../src/http-api-gateway.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AddressDto, StudentDto } from '@libs/shared';

describe('HttpApiGatewayController (e2e)', () => {
  let app: INestApplication;
  let studentId: string;
  let accessToken: string;
  const name = 'Nagy Aladár';
  const email = 'nagy.aladar@gmail.com';
  const address = '4600, Budapest Nagy út. 15';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        HttpApiGatewayModule,
        ClientsModule.register([
          {
            name: 'NATS_SERVER',
            transport: Transport.NATS,
            options: { servers: ['nats://nats:4222'] },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/students/create')
      .send({ name, email })
      .expect(201)
      .expect((response) => {
        const { body } = response;
        expect(body).toHaveProperty('id');
        expect(body.name).toBe(name);
        expect(body.email).toBe(email);
      });

    studentId = response.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    const { body } = loginResponse;

    expect(body).toHaveProperty('accessToken');

    accessToken = body.accessToken;
  });

  it('/students/list (GET) - should get students from microservice', async () => {
    await request(app.getHttpServer())
      .get('/students/list')
      .expect(200)
      .expect((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length <= 100).toBe(true);
      });
  });

  it('/students/update (PUT) - should update the student from microservice', async () => {
    const newName = 'Horváth Ádám';
    const newEmail = 'horvat.adam.@gmail.com';

    await request(app.getHttpServer())
      .put('/students/update')
      .send({ name: newName, email: newEmail, id: studentId })
      .expect(200)
      .expect((response) => {
        const { body } = response;
        expect(body.id).toBe(studentId);
        expect(body.name).toBe(newName);
        expect(body.email).toBe(newEmail);
      });
  });

  it('/students/delete (DELETE) - should delete the student from microservice', async () => {
    const response = await request(app.getHttpServer())
      .delete('/students/delete/' + studentId)
      .expect(200);

    expect(response.text).toBe(studentId);
  });

  it('/students/list (GET) - student should not in the list after delete from microservice', async () => {
    const response = await request(app.getHttpServer())
      .get('/students/list')
      .expect(200)
      .expect((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });

    const studentInList = response.body.find(
      (student: StudentDto) => student.id === studentId,
    );

    expect(studentInList).toBeUndefined();
  });

  it('/addresses/create (POST) - should create an new address from microservice', async () => {
    await request(app.getHttpServer())
      .post('/addresses/create')
      .set('Authorization', `Bearer  ${accessToken}`)
      .send({ address })
      .expect(201)
      .expect((response) => {
        const { body } = response;

        expect(body).toHaveProperty('id');
        expect(body.address).toBe(address);
      });
  });

  it('./addresses/list (GET) - should get addresses from microservice', async () => {
    await request(app.getHttpServer())
      .get('/addresses/list')
      .set('Authorization', `Bearer  ${accessToken}`)
      .expect(200)
      .expect((response) => {
        const { body } = response;
        expect(Array.isArray(body)).toBe(true);
        expect(body.length <= 100).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
