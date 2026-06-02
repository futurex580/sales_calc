import { Module } from '@nestjs/common';
import { IncentiveProgramsService } from './incentive-programs.service';
import { IncentiveProgramsController } from './incentive-programs.controller';

@Module({
  controllers: [IncentiveProgramsController],
  providers: [IncentiveProgramsService],
})
export class IncentiveProgramsModule {}
