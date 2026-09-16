import { Module } from '@nestjs/common';

import { SetorSampahController } from './setor-sampah.controller.js';
import { SetorSampahService } from './setor-sampah.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [SetorSampahController],
  providers: [SetorSampahService],
})
export class SetorSampahModule {}