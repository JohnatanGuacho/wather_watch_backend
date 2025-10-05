import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrecipitacionController } from './precipitacion.controller';
import { PrecipitacionService } from './precipitacion.service';

@Module({
  imports: [HttpModule],
  controllers: [PrecipitacionController],
  providers: [PrecipitacionService],
})
export class PrecipitacionModule {}
