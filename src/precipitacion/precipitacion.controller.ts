import { Controller, Get, Query } from '@nestjs/common';
import { PrecipitacionService } from './precipitacion.service';
import { GetPrecipitacionDto } from './dto/get-precipitaciones.dto';

@Controller('precipitacion')
export class PrecipitacionController {
  constructor(private readonly service: PrecipitacionService) {}

  @Get('summary')
  async getSummary(@Query() q: GetPrecipitacionDto) {
    const { lat, lon, days } = q;
    return this.service.getDailySeries(lat, lon, days);
  }
}
