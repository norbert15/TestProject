import { LoginDto } from '@libs/shared';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('NATS_SERVER') private readonly natsServer: ClientProxy,
  ) {}

  @Post('login')
  login(@Body() login: LoginDto): Promise<{ accessToken: string }> {
    return firstValueFrom(this.natsServer.send('login', login));
  }
}
