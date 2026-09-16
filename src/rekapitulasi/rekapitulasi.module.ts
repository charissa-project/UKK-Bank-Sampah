import { Module } from '@nestjs/common';

import { RekapitulasiController } from './rekapitulasi.controller.js';
import { RekapitulasiService } from './rekapitulasi.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [RekapitulasiController],
  providers: [RekapitulasiService],
})
export class RekapitulasiModule {}