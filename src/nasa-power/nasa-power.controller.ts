import { Controller, Get, Query } from '@nestjs/common';
import { NasaPowerService } from './nasa-power.service';
import { IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class ClimateQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;

  @IsString()
  start: string; // YYYYMMDD

  @IsString()
  end: string;   // YYYYMMDD
}

@Controller('nasa-power')
export class NasaPowerController {
  constructor(private readonly service: NasaPowerService) {}

  @Get('daily')
  async getDaily(@Query() query: ClimateQueryDto) {
    const { lat, lon, start, end } = query;
    return this.service.getDailyClimate(lat, lon, start, end);
  }
}
