import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemSetorDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID kategori sampah',
  })
  @IsUUID()
  @IsNotEmpty()
  kategoriSampahId: string;

  @ApiProperty({
    example: 2.5,
    description: 'Berat sampah dalam kilogram',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beratKg: number;
}

export class CreateSetorSampahDto {
  @ApiProperty({
    example: '2026-09-16T09:00:00.000Z',
    description: 'Tanggal setor sampah',
  })
  @IsDateString()
  @IsNotEmpty()
  tanggal: string;

  @ApiProperty({
    example: 'Sampah sudah dipilah dan siap untuk disetorkan.',
    description: 'Catatan dari nasabah',
  })
  @IsString()
  @IsNotEmpty()
  catatan: string;

  @ApiProperty({
    type: [ItemSetorDto],
    example: [
      {
        kategoriSampahId: '550e8400-e29b-41d4-a716-446655440000',
        beratKg: 2.5,
      },
    ],
    description: 'Daftar sampah yang disetorkan',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSetorDto)
  items: ItemSetorDto[];
}