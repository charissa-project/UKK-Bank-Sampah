import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { RekapitulasiService } from './rekapitulasi.service.js';
import { RekapitulasiQueryDto } from './dto/rekapitulasi-query.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('rekapitulasi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RekapitulasiController {
  constructor(
    private readonly rekapitulasiService: RekapitulasiService,
  ) {}

  @Get('bulanan')
  async getBulanan(@Query() query: RekapitulasiQueryDto) {
    return this.rekapitulasiService.getBulanan(query.bulan);
  }
}