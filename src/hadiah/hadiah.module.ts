import { Module } from '@nestjs/common';
import { HadiahController } from './hadiah.controller.js';
import { HadiahService } from './hadiah.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HadiahController],
  providers: [HadiahService],
})
export class HadiahModule {}