import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PenukaranPoinService } from './penukaran-poin.service.js';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto.js';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('penukaran-poin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenukaranPoinController {
  constructor(
    private readonly penukaranPoinService: PenukaranPoinService,
  ) {}

  @Post('tukar')
  @Roles('NASABAH')
  async create(
    @Req() req: any,
    @Body() dto: CreatePenukaranPoinDto,
  ) {
    return this.penukaranPoinService.create(
      req.user.userId,
      dto,
    );
  }

  @Get('my-penukaran')
  @Roles('NASABAH')
  async findMyPenukaran(@Req() req: any) {
    return this.penukaranPoinService.findMyPenukaran(
      req.user.userId,
    );
  }

  @Get('admin/list')
  @Roles('ADMIN')
  async findAll(@Query('bulan') bulan?: string) {
    return this.penukaranPoinService.findAll(bulan);
  }

  @Put('admin/status/:id')
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusPenukaranDto,
  ) {
    return this.penukaranPoinService.updateStatus(
      id,
      dto,
    );
  }

  @Get('nota/:id')
  @Roles('NASABAH', 'ADMIN')
  async findNota(@Param('id') id: string) {
    return this.penukaranPoinService.findNota(id);
  }
}