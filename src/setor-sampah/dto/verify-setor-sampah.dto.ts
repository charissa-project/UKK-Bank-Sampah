import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum StatusVerifikasi {
  DIVERIFIKASI = 'diverifikasi',
  DITOLAK = 'ditolak',
  SELESAI = 'selesai',
}

export class VerifyItemSetorDto {
  @IsUUID()
  @IsNotEmpty()
  kategoriSampahId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beratKgReal: number;
}

export class VerifySetorSampahDto {
  @IsEnum(StatusVerifikasi)
  @IsNotEmpty()
  status: StatusVerifikasi;

  @IsString()
  @IsNotEmpty()
  catatanAdmin: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VerifyItemSetorDto)
  itemsReal?: VerifyItemSetorDto[];
}