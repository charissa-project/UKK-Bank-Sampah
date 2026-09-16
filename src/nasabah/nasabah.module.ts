import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { NasabahController } from './nasabah.controller.js';
import { NasabahService } from './nasabah.service.js';

@Module({
  imports: [AuthModule],
  controllers: [NasabahController],
  providers: [NasabahService],
})
export class NasabahModule {}