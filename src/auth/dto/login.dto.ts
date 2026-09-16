import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'nasabah_budi',
    description: 'Username akun',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password akun',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}