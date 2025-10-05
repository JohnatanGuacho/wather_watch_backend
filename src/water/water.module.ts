import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WaterController } from './water.controller';
import { WaterService } from './water.service';

@Module({
  imports: [HttpModule],
  controllers: [WaterController],
  providers: [WaterService],
})
export class WaterModule {}
