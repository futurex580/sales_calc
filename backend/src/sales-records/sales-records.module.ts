import { Module } from '@nestjs/common';
import { SalesRecordsService } from './sales-records.service';
import { SalesRecordsController } from './sales-records.controller';

@Module({
  controllers: [SalesRecordsController],
  providers: [SalesRecordsService],
})
export class SalesRecordsModule {}
