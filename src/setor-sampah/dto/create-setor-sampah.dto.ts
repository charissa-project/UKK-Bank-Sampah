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
  @IsUUID()
  @IsNotEmpty()
  kategoriSampahId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beratKg: number;
}

export class CreateSetorSampahDto {
  @IsDateString()
  @IsNotEmpty()
  tanggal: string;

  @IsString()
  @IsNotEmpty()
  catatan: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSetorDto)
  items: ItemSetorDto[];
}