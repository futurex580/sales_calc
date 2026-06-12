import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IncentiveProgramsService } from './incentive-programs.service';
import { Prisma } from '@prisma/client';
import { CreateIncentiveProgramDto } from './dto/create-incentive-program.dto';
import { UpdateIncentiveProgramDto } from './dto/update-incentive-program.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('incentive-programs')
export class IncentiveProgramsController {
  constructor(private readonly incentiveProgramsService: IncentiveProgramsService) {}

  @Post()
  create(@Body() createIncentiveProgramDto: CreateIncentiveProgramDto) {
    return this.incentiveProgramsService.create(createIncentiveProgramDto);
  }

  @Get('kpi/report')
  getKpiReport(@Req() req: any) {
    return this.incentiveProgramsService.getKpiReport(req.user.companyId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.incentiveProgramsService.findAll(req.user.companyId);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incentiveProgramsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncentiveProgramDto: UpdateIncentiveProgramDto) {
    return this.incentiveProgramsService.update(id, updateIncentiveProgramDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incentiveProgramsService.remove(id);
  }
}
