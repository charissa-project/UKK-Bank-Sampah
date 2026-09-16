import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({
    example: 'admin_banksampah',
    description: 'Username admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Password admin minimal 6 karakter',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Bank Sampah Asri Jaya',
    description: 'Nama unit bank sampah',
  })
  @IsString()
  @IsNotEmpty()
  namaUnit: string;

  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama pengelola bank sampah',
  })
  @IsString()
  @IsNotEmpty()
  namaPengelola: string;

  @ApiProperty({
    example: '081234567890',
    description: 'Nomor telepon pengelola',
  })
  @IsString()
  @IsNotEmpty()
  telp: string;
}