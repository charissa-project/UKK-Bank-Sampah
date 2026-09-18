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

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('kategori-sampah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KategoriSampahController {
  constructor(
    private readonly kategoriSampahService: KategoriSampahService,
  ) {}

  // GET semua kategori
  @Get()
  @Roles('ADMIN', 'NASABAH')
  async findAll() {
    return this.kategoriSampahService.findAll();
  }

  // POST kategori
  @Post()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaKategori: {
          type: 'string',
          example: 'Botol Plastik',
        },
        hargaPerKg: {
          type: 'number',
          example: 5000,
        },
        poinPerKg: {
          type: 'number',
          example: 50,
        },
        jenis: {
          type: 'string',
          example: 'plastik',
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'namaKategori',
        'hargaPerKg',
        'poinPerKg',
        'jenis',
      ],
    },
  })
  async create(
    @Body() dto: CreateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.create(dto, file);
  }

  // GET detail kategori
  @Get(':id')
  @Roles('ADMIN', 'NASABAH')
  async findOne(@Param('id') id: string) {
    return this.kategoriSampahService.findOne(id);
  }

  // PUT kategori
  @Put(':id')
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaKategori: {
          type: 'string',
          example: 'Botol Plastik',
        },
        hargaPerKg: {
          type: 'number',
          example: 5000,
        },
        poinPerKg: {
          type: 'number',
          example: 50,
        },
        jenis: {
          type: 'string',
          example: 'plastik',
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.update(id, dto, file);
  }

  // DELETE kategori
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.kategoriSampahService.remove(id);
  }
}