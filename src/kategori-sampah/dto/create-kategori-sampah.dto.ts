import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum JenisSampah {
  PLASTIK = 'plastik',
  KERTAS = 'kertas',
  LOGAM = 'logam',
  KACA = 'kaca',
}

export class CreateKategoriSampahDto {
  @ApiProperty({
    example: 'Botol Plastik',
    description: 'Nama kategori sampah',
  })
  @IsString()
  @IsNotEmpty()
  namaKategori: string;

  @ApiProperty({
    example: 5000,
    description: 'Harga sampah per kilogram',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hargaPerKg: number;

  @ApiProperty({
    example: 50,
    description: 'Poin yang didapat per kilogram',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poinPerKg: number;

  @ApiProperty({
    example: 'plastik',
    enum: JenisSampah,
    description: 'Jenis sampah',
  })
  @IsEnum(JenisSampah)
  @IsNotEmpty()
  jenis: JenisSampah;
}