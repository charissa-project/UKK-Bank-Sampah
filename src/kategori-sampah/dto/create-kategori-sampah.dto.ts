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