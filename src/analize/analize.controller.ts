import { Controller, Get, Query } from '@nestjs/common';
import { AnalyzeService } from './analize.service';

@Controller('analyze')
export class AnalyzeController {
  constructor(private readonly service: AnalyzeService) {}

  @Get()
  async analyze(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('iso3') iso3: string,
  ) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    return this.service.analyzePoint(latNum, lonNum, iso3);
  }
}
