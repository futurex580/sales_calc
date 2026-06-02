import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionRuleTiersService } from './commission-rule-tiers.service';
import { Prisma } from '@prisma/client';

@Controller('commission-rule-tiers')
export class CommissionRuleTiersController {
  constructor(private readonly commissionRuleTiersService: CommissionRuleTiersService) {}

  @Post()
  create(@Body() createCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedCreateInput) {
    return this.commissionRuleTiersService.create(createCommissionRuleTierDto);
  }

  @Get()
  findAll() {
    return this.commissionRuleTiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionRuleTiersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommissionRuleTierDto: Prisma.CommissionRuleTierUncheckedUpdateInput) {
    return this.commissionRuleTiersService.update(id, updateCommissionRuleTierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commissionRuleTiersService.remove(id);
  }
}