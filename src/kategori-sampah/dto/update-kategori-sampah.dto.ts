import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { JenisSampah } from './create-kategori-sampah.dto.js';

export class UpdateKategoriSampahDto {
  @IsString()
  @IsNotEmpty()
  namaKategori: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hargaPerKg: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poinPerKg: number;

  @IsEnum(JenisSampah)
  @IsNotEmpty()
  jenis: JenisSampah;
}