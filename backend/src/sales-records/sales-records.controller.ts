import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SalesRecordsService } from './sales-records.service';
import { Prisma } from '@prisma/client';

@Controller('sales-records')
export class SalesRecordsController {
  constructor(private readonly salesRecordsService: SalesRecordsService) {}

  @Post()
  create(@Body() createSalesRecordDto: Prisma.SalesRecordUncheckedCreateInput) {
    return this.salesRecordsService.create(createSalesRecordDto);
  }

  @Get()
  findAll() {
    return this.salesRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesRecordsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesRecordDto: Prisma.SalesRecordUncheckedUpdateInput) {
    return this.salesRecordsService.update(id, updateSalesRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesRecordsService.remove(id);
  }
}
