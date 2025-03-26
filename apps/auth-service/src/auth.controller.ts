import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto } from '@libs/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('login')
  async login(@Payload() data: LoginDto): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.login(
      data.username,
      data.password,
    );

    return { accessToken };
  }
}
