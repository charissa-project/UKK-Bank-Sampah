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

import { SetorSampahService } from './setor-sampah.service.js';

import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto.js';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('setor-sampah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SetorSampahController {
  constructor(
    private readonly setorSampahService: SetorSampahService,
  ) {}

  @Post('pengajuan')
  @Roles('NASABAH')
  async create(
    @Req() req: any,
    @Body() dto: CreateSetorSampahDto,
  ) {
    return this.setorSampahService.create(
      req.user.userId,
      dto,
    );
  }

  @Get('my-setor')
  @Roles('NASABAH')
  async findMySetor(
    @Req() req: any,
    @Query('bulan') bulan?: string,
  ) {
    return this.setorSampahService.findMySetor(
      req.user.userId,
      bulan,
    );
  }

  @Get('admin/list')
  @Roles('ADMIN')
  async findAll(
    @Query('status') status?: string,
    @Query('bulan') bulan?: string,
  ) {
    return this.setorSampahService.findAll(
      status,
      bulan,
    );
  }

  @Get(':id')
  @Roles('NASABAH', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.setorSampahService.findOne(id);
  }

  @Put('admin/verify/:id')
  @Roles('ADMIN')
  async verify(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: VerifySetorSampahDto,
  ) {
    return this.setorSampahService.verify(
      id,
      req.user.userId,
      dto,
    );
  }
}