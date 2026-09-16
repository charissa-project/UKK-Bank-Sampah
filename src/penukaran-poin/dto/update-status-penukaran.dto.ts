import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum StatusPenukaranApi {
  DIPROSES = 'diproses',
  SELESAI = 'selesai',
}

export class UpdateStatusPenukaranDto {
  @ApiProperty({
    example: 'selesai',
    enum: StatusPenukaranApi,
    description: 'Status penukaran poin',
  })
  @IsEnum(StatusPenukaranApi)
  @IsNotEmpty()
  status: StatusPenukaranApi;
}