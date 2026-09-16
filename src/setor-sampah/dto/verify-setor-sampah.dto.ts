import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID kategori sampah',
  })
  @IsUUID()
  @IsNotEmpty()
  kategoriSampahId: string;

  @ApiProperty({
    example: 2.2,
    description: 'Berat sampah sebenarnya dalam kilogram',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beratKgReal: number;
}

export class VerifySetorSampahDto {
  @ApiProperty({
    example: 'selesai',
    enum: StatusVerifikasi,
    description: 'Status verifikasi setor sampah',
  })
  @IsEnum(StatusVerifikasi)
  @IsNotEmpty()
  status: StatusVerifikasi;

  @ApiProperty({
    example: 'Sampah sudah diverifikasi dan diterima.',
    description: 'Catatan dari admin',
  })
  @IsString()
  @IsNotEmpty()
  catatanAdmin: string;

  @ApiPropertyOptional({
    type: [VerifyItemSetorDto],
    example: [
      {
        kategoriSampahId: '550e8400-e29b-41d4-a716-446655440000',
        beratKgReal: 2.2,
      },
    ],
    description: 'Data berat sampah setelah verifikasi',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VerifyItemSetorDto)
  itemsReal?: VerifyItemSetorDto[];
}