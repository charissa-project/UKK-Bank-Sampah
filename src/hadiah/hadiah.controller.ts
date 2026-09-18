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

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

import { HadiahService } from './hadiah.service.js';
import { CreateHadiahDto } from './dto/create-hadiah.dto.js';
import { UpdateHadiahDto } from './dto/update-hadiah.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiBearerAuth()
@Controller('hadiah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HadiahController {
  constructor(
    private readonly hadiahService: HadiahService,
  ) {}

  @Get()
  @Roles('ADMIN', 'NASABAH')
  async findAll() {
    return this.hadiahService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Tambah hadiah',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaHadiah: {
          type: 'string',
          example: 'Tumbler',
        },
        poinDibutuhkan: {
          type: 'number',
          example: 100,
        },
        stok: {
          type: 'number',
          example: 10,
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['namaHadiah', 'poinDibutuhkan', 'stok'],
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateHadiahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.hadiahService.create(dto, file);
  }

  @Get(':id')
  @Roles('ADMIN', 'NASABAH')
  async findOne(@Param('id') id: string) {
    return this.hadiahService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update hadiah',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaHadiah: {
          type: 'string',
          example: 'Tumbler Premium',
        },
        poinDibutuhkan: {
          type: 'number',
          example: 150,
        },
        stok: {
          type: 'number',
          example: 20,
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
    @Body() dto: UpdateHadiahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.hadiahService.update(id, dto, file);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.hadiahService.remove(id);
  }
}