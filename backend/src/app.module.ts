import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationModule } from './simulation/simulation.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesRecordsModule } from './sales-records/sales-records.module';
import { IncentiveProgramsModule } from './incentive-programs/incentive-programs.module';
import { CommissionRuleTiersModule } from './commission-rule-tiers/commission-rule-tiers.module';
import { CommissionRecordsModule } from './commission-records/commission-records.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';


@Module({
   imports: [SimulationModule, PrismaModule, CompaniesModule, UsersModule, ProductsModule, SalesRecordsModule, IncentiveProgramsModule, CommissionRuleTiersModule, CommissionRecordsModule, AuthModule, AnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
