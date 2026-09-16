import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller.js';
import { SeedService } from './seed.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}