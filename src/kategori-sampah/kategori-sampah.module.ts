import { Module } from '@nestjs/common';

import { KategoriSampahController } from './kategori-sampah.controller.js';
import { KategoriSampahService } from './kategori-sampah.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [KategoriSampahController],
  providers: [KategoriSampahService],
})
export class KategoriSampahModule {}