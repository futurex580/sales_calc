import { Module } from '@nestjs/common';
import { CommissionRuleTiersService } from './commission-rule-tiers.service';
import { CommissionRuleTiersController } from './commission-rule-tiers.controller';

@Module({
  controllers: [CommissionRuleTiersController],
  providers: [CommissionRuleTiersService],
})
export class CommissionRuleTiersModule {}
