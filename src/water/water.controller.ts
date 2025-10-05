import { Controller, Get, Query } from '@nestjs/common';
import { WaterService } from './water.service';
import { GetWaterDto } from './dto/get-water.dto';

@Controller('water')
export class WaterController {
  constructor(private readonly service: WaterService) {}

  // ping de verificación
  @Get()
  ping() {
    return { ok: true, recurso: 'water' };
  }

  @Get('bodies')
  async getBodies(@Query() q: GetWaterDto) {
    const { lat, lon, radiusKm } = q;
    return this.service.getBodies(lat, lon, radiusKm);
  }
}
