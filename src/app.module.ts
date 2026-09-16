import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { NasabahModule } from './nasabah/nasabah.module.js';
import { KategoriSampahModule } from './kategori-sampah/kategori-sampah.module.js';
import { SetorSampahModule } from './setor-sampah/setor-sampah.module.js';
import { HadiahModule } from './hadiah/hadiah.module.js';
import { PenukaranPoinModule } from './penukaran-poin/penukaran-poin.module.js';
import { RekapitulasiModule } from './rekapitulasi/rekapitulasi.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { SeedModule } from './seed/seed.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CloudinaryService } from './cloudinary/cloudinary.service.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ServeStaticModule.forRoot({
  rootPath: join(process.cwd(), 'uploads'),
  serveRoot: '/uploads',
}),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'bank-sampah-backend',
    }),
    PrismaModule,
    AuthModule,
    NasabahModule,
    KategoriSampahModule,
    SetorSampahModule,
    HadiahModule,
    PenukaranPoinModule,
    RekapitulasiModule,
    DashboardModule,
    SeedModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
