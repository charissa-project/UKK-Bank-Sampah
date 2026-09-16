import {
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SeedService } from './seed.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('seed')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seed() {
    return this.seedService.seed();
  }
}