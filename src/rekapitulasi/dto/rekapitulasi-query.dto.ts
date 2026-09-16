import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class RekapitulasiQueryDto {
  @ApiProperty({
    example: '2026-09',
    description: 'Bulan rekapitulasi dengan format YYYY-MM',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Format bulan harus YYYY-MM',
  })
  bulan: string;
}