import { IsEnum, IsNotEmpty } from 'class-validator';

export enum StatusPenukaranApi {
  DIPROSES = 'diproses',
  SELESAI = 'selesai',
}

export class UpdateStatusPenukaranDto {
  @IsEnum(StatusPenukaranApi)
  @IsNotEmpty()
  status: StatusPenukaranApi;
}