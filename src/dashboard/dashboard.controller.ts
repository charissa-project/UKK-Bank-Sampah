import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  @Roles('NASABAH')
  async getSummary(@Req() req: any) {
    return this.dashboardService.getSummary(req.user.userId);
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.dashboardService.getStats();
  }
}