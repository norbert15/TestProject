import { Module } from '@nestjs/common';
import { ProfileModule } from './profiles/profile.module';

@Module({
  imports: [ProfileModule],
})
export class AppModule {}
