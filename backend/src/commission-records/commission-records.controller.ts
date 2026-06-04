import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CommissionRecordsService } from './commission-records.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('commission-records')
export class CommissionRecordsController {
  constructor(private readonly commissionRecordsService: CommissionRecordsService) {}

  @Post()
  create(@Body() createCommissionRecordDto: Prisma.CommissionRecordUncheckedCreateInput) {
    return this.commissionRecordsService.create(createCommissionRecordDto);
  }

  // NOTE: This MUST be placed above the `@Get(':id')` route!
  @Get('payout-report')
  getPayoutReport() {
    return this.commissionRecordsService.getPayoutReport();
  }

  @Get()
  findAll() {
    return this.commissionRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionRecordsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommissionRecordDto: Prisma.CommissionRecordUncheckedUpdateInput) {
    return this.commissionRecordsService.update(id, updateCommissionRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commissionRecordsService.remove(id);
  }
}
