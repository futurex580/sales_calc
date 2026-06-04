// e:\Personal\Project\AppTest\sales_calc\backend\src\sales-records\sales-records.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request} from '@nestjs/common';
import { SalesRecordsService } from './sales-records.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('sales-records')
export class SalesRecordsController {
  constructor(private readonly salesRecordsService: SalesRecordsService) {}

  @Post()
  create(@Body() createSalesRecordDto: Prisma.SalesRecordUncheckedCreateInput, @Request() req: any) {
    // Securely extract the user and company from the verified token
    const userId = req.user.id;
    const companyId = req.user.companyId;
    return this.salesRecordsService.create(createSalesRecordDto, userId, companyId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.salesRecordsService.findAll({
      userId: req.user.id || req.user.sub,
      companyId: req.user.companyId,
      role: req.user.role,
    });
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
