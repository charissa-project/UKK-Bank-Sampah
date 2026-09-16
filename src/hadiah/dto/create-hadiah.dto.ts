import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHadiahDto {
  @IsString()
  @IsNotEmpty()
  namaHadiah: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poinDibutuhkan: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stok: number;
}