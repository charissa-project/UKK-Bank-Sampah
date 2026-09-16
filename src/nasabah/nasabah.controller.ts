import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { NasabahService } from './nasabah.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { CreateNasabahDto } from './dto/create-nasabah.dto.js';
import { UpdateNasabahDto } from './dto/update-nasabah.dto.js';

@Controller('admin/nasabah')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class NasabahController {
  constructor(private readonly nasabahService: NasabahService) {}

  // GET SEMUA NASABAH
  @Get()
  async findAll() {
    return this.nasabahService.findAll();
  }

  // TAMBAH NASABAH
  @Post()
  async create(@Body() dto: CreateNasabahDto) {
    return this.nasabahService.create(dto);
  }

  // GET DETAIL NASABAH
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nasabahService.findOne(id);
  }

  // UPDATE NASABAH
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNasabahDto,
  ) {
    return this.nasabahService.update(id, dto);
  }

  // DELETE NASABAH
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.nasabahService.remove(id);
  }
}