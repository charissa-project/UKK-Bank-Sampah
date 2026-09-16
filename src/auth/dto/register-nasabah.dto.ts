import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterNasabahDto {
  @ApiProperty({
    example: 'nasabah_budi',
    description: 'Username nasabah',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password minimal 6 karakter',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap nasabah',
  })
  @IsString()
  @IsNotEmpty()
  namaNasabah: string;

  @ApiProperty({
    example: 'Jl. Mawar No. 10, Malang',
    description: 'Alamat nasabah',
  })
  @IsString()
  @IsNotEmpty()
  alamat: string;

  @ApiProperty({
    example: '081234567890',
    description: 'Nomor telepon nasabah',
  })
  @IsString()
  @IsNotEmpty()
  telp: string;
}