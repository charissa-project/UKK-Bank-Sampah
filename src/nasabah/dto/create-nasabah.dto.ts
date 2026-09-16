import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateNasabahDto {
  @ApiProperty({
    example: 'nasabah_budi',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Budi Santoso',
  })
  @IsString()
  @IsNotEmpty()
  namaNasabah: string;

  @ApiProperty({
    example: 'Jl. Mawar No. 10, Malang',
  })
  @IsString()
  @IsNotEmpty()
  alamat: string;

  @ApiProperty({
    example: '081234567890',
  })
  @IsString()
  @IsNotEmpty()
  telp: string;

  @ApiProperty({
    example: '2008-01-16',
    description: 'Tanggal lahir dengan format YYYY-MM-DD',
  })
  @IsDateString()
  @IsNotEmpty()
  tanggalLahir: string;
}