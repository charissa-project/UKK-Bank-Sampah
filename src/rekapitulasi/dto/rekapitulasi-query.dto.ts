import { IsNotEmpty, Matches } from 'class-validator';

export class RekapitulasiQueryDto {
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Format bulan harus YYYY-MM',
  })
  bulan: string;
}