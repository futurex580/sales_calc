import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IncentiveProgramsService } from './incentive-programs.service';
import { Prisma } from '@prisma/client';

@Controller('incentive-programs')
export class IncentiveProgramsController {
  constructor(private readonly incentiveProgramsService: IncentiveProgramsService) {}

  @Post()
  create(@Body() createIncentiveProgramDto: Prisma.IncentiveProgramUncheckedCreateInput) {
    return this.incentiveProgramsService.create(createIncentiveProgramDto);
  }

  @Get()
  findAll() {
    return this.incentiveProgramsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incentiveProgramsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncentiveProgramDto: Prisma.IncentiveProgramUncheckedUpdateInput) {
    return this.incentiveProgramsService.update(id, updateIncentiveProgramDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incentiveProgramsService.remove(id);
  }
}
