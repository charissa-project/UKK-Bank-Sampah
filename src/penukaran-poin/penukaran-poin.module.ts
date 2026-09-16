import { Module } from '@nestjs/common';
import { PenukaranPoinController } from './penukaran-poin.controller.js';
import { PenukaranPoinService } from './penukaran-poin.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PenukaranPoinController],
  providers: [PenukaranPoinService],
})
export class PenukaranPoinModule {}