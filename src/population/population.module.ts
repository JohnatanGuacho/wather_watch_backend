import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PopulationService } from './population.service';
import { PopulationController } from './population.controller';

@Module({
  imports: [HttpModule],
  controllers: [PopulationController],
  providers: [PopulationService],
  exports: [PopulationService],
})
export class PopulationModule {}
