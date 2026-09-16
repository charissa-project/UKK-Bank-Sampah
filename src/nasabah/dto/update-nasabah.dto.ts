import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNasabahDto {
  @ApiPropertyOptional({
    example: 'Budi Santoso',
  })
  @IsOptional()
  @IsString()
  namaLengkap?: string;

  @ApiPropertyOptional({
    example: '081234567890',
  })
  @IsOptional()
  @IsString()
  noTelepon?: string;

  @ApiPropertyOptional({
    example: 'Jl. Mawar No. 10, Malang',
  })
  @IsOptional()
  @IsString()
  alamat?: string;

  @ApiPropertyOptional({
    example: '2008-01-16',
  })
  @IsOptional()
  @IsString()
  tanggalLahir?: string;
}