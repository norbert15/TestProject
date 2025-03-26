import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginDto, MockStudentRepositroy } from '@libs/shared';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseInitService } from './services/database-init.service';

describe('AuthController', () => {
  let authController: AuthController;
  let databaseInitService: DatabaseInitService;

  const user: LoginDto = { password: 'admin', username: 'admin' };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        JwtModule.register({
          secret: 'test',
          global: true,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
        DatabaseInitService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MockStudentRepositroy,
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    databaseInitService = app.get<DatabaseInitService>(DatabaseInitService);

    const newUser = await databaseInitService.onModuleInit();

    expect(newUser).toBeDefined();
    expect(newUser.username).toBe(user.username);
    expect(newUser).toHaveProperty('id');
    expect(newUser).toHaveProperty('password');
  });

  it('should be logged in', async () => {
    const loginResult = await authController.login(user);

    expect(loginResult).toBeDefined();
    expect(loginResult).toHaveProperty('accessToken');
  });
});
