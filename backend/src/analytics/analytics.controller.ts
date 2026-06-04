import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('predict')
  predictProgramResult(@Body() draftProgram: any, @Request() req: any) {
    return this.analyticsService.predictProgramResult(draftProgram, req.user.companyId);
  }
}