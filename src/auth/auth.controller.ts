import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { RegisterNasabahDto } from './dto/register-nasabah.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('nasabah/register')
  @ApiOperation({
    summary: 'Register nasabah baru',
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
      ],
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
    }),
  )
  async registerNasabah(
    @Body() dto: RegisterNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.registerNasabah(dto, file);
  }

  @Post('admin/register')
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return this.authService.me(req.user);
  }
}