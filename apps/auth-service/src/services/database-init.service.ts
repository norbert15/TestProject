import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit(): Promise<UserEntity> {
    const existingUser = await this.authService.findByUsername('admin');
    if (!existingUser) {
      const createdUser = await this.authService.createUser('admin', 'admin');
      console.log('Admin user created');
      return createdUser;
    }

    console.log('Admin user already exists');
    return existingUser;
  }
}
