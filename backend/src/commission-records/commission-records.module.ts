import { Module } from '@nestjs/common';
import { CommissionRecordsService } from './commission-records.service';
import { CommissionRecordsController } from './commission-records.controller';

@Module({
  controllers: [CommissionRecordsController],
  providers: [CommissionRecordsService],
})
export class CommissionRecordsModule {}
