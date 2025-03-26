import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { AuthController } from './auth.controller';
import { LoginDto } from '@libs/shared';

describe('AuthController', () => {
  let authController: AuthController;
  let clientProxyMock: Partial<ClientProxy>;

  const result = { accessToken: 'test' };

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn((pattern): Observable<any> => {
        if (pattern === 'login') {
          return of(result);
        }

        return of(null);
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: 'NATS_SERVER', useValue: clientProxyMock }],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  it('should return an access token', async () => {
    const loginDto: LoginDto = { password: 'admin', username: 'admin' };
    const loginResult = await authController.login(loginDto);

    expect(loginResult).toBeDefined();
    expect(loginResult).toHaveProperty('accessToken');
    expect(clientProxyMock.send).toHaveBeenCalledWith('login', loginDto);
  });
});
