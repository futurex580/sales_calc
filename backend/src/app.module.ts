import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [SimulationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
