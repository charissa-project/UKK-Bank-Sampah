import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHadiahDto {
  @ApiProperty({
    example: 'Tumbler Eco Premium',
    description: 'Nama hadiah',
  })
  @IsString()
  @IsNotEmpty()
  namaHadiah: string;

  @ApiProperty({
    example: 150,
    description: 'Jumlah poin yang dibutuhkan',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poinDibutuhkan: number;

  @ApiProperty({
    example: 10,
    description: 'Jumlah stok hadiah',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stok: number;
}