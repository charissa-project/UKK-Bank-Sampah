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

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

import { NasabahService } from './nasabah.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { CreateNasabahDto } from './dto/create-nasabah.dto.js';
import { UpdateNasabahDto } from './dto/update-nasabah.dto.js';

@ApiBearerAuth()
@Controller('admin/nasabah')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class NasabahController {
  constructor(
    private readonly nasabahService: NasabahService,
  ) {}

  @Get()
  async findAll() {
    return this.nasabahService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Tambah nasabah',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'nasabah_budi',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
        namaNasabah: {
          type: 'string',
          example: 'Budi Santoso',
        },
        alamat: {
          type: 'string',
          example: 'Jl. Mawar No. 10, Malang',
        },
        telp: {
          type: 'string',
          example: '081234567890',
        },
        tanggalLahir: {
          type: 'string',
          example: '2008-01-16',
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'username',
        'password',
        'namaNasabah',
        'alamat',
        'telp',
        'tanggalLahir',
      ],
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.nasabahService.create(dto, file);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nasabahService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update data nasabah',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaLengkap: {
          type: 'string',
          example: 'Budi Santoso',
        },
        noTelepon: {
          type: 'string',
          example: '081234567890',
        },
        alamat: {
          type: 'string',
          example: 'Jl. Mawar No. 10, Malang',
        },
        tanggalLahir: {
          type: 'string',
          example: '2008-01-16',
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.nasabahService.update(id, dto, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.nasabahService.remove(id);
  }
}