import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { PenukaranPoinService } from './penukaran-poin.service.js';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto.js';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiBearerAuth()
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
@Roles('ADMIN', 'NASABAH')
@ApiOperation({
  summary: 'Download nota penukaran poin',
})
@ApiProduces('application/pdf')
@ApiResponse({
  status: 200,
  description: 'Nota penukaran poin berhasil dibuat',
  content: {
    'application/pdf': {},
  },
})
async getNota(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const pdf = await this.penukaranPoinService.findNota(id);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="nota-${id}.pdf"`,
    'Content-Length': pdf.length,
  });

  res.end(pdf);
}
}