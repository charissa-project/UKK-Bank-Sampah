import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { KategoriSampahService } from './kategori-sampah.service.js';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto.js';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';


@Controller('kategori-sampah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KategoriSampahController {
  constructor(
    private readonly kategoriSampahService: KategoriSampahService,
  ) {}

  // GET semua kategori
  // Bisa diakses ADMIN dan NASABAH
  @Get()
  @Roles('ADMIN', 'NASABAH')
  async findAll() {
    return this.kategoriSampahService.findAll();
  }

  // POST kategori
  // Hanya ADMIN
  @Post()
  @Roles('ADMIN')
 @UseInterceptors(
  FileInterceptor('foto', {
    storage: memoryStorage(),
  }),
)

  async create(
    @Body() dto: CreateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.create(dto, file);
  }

  // GET detail kategori
  // Bisa diakses ADMIN dan NASABAH
  @Get(':id')
  @Roles('ADMIN', 'NASABAH')
  async findOne(@Param('id') id: string) {
    return this.kategoriSampahService.findOne(id);
  }

  // PUT kategori
  // Hanya ADMIN
  @Put(':id')
  @Roles('ADMIN')
  @UseInterceptors(
  FileInterceptor('foto', {
    storage: memoryStorage(),
  }),
)

  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.update(id, dto, file);
  }

  // DELETE kategori
  // Hanya ADMIN
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.kategoriSampahService.remove(id);
  }
}