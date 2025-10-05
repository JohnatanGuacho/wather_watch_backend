import { Controller, Get, Query } from '@nestjs/common';
import { PopulationService } from './population.service';

@Controller('population')
export class PopulationController {
  constructor(private readonly populationService: PopulationService) {}

  /**
   * Consulta la población por país (API JSON)
   */
  @Get('country')
  async getPopulationByCountry(
    @Query('iso3') iso3: string,
    @Query('year') year?: string,
    @Query('project') project?: string,
  ) {
    if (!iso3) {
      return {
        error: 'Debe proporcionar el parámetro iso3 (ejemplo: ECU, BRA, PER, AUS)',
      };
    }

    return await this.populationService.getPopulationByCountry(
      iso3.toUpperCase(),
      year,
      project,
    );
  }

  /**
   * Lista de años disponibles para un país
   */
  @Get('years')
  async getAvailableYears(@Query('iso3') iso3: string) {
    if (!iso3) {
      return { error: 'Debe proporcionar el parámetro iso3.' };
    }

    const data = await this.populationService.getPopulationByCountry(iso3.toUpperCase());
    return {
      iso3: iso3.toUpperCase(),
      total_records: data.total_records,
      available_years: data.available_years,
    };
  }

  /**
   * Devuelve la densidad poblacional para una coordenada (lat/lon)
   * Ejemplo:
   * /api/population/point?iso3=ECU&year=2020&lat=-0.22985&lon=-78.52495
   */
  @Get('point')
  async getPopulationAtPoint(
    @Query('iso3') iso3: string,
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('year') year?: string,
  ) {
    if (!iso3 || !lat || !lon) {
      return {
        error: 'Debe proporcionar iso3, lat y lon. Ejemplo: ?iso3=ECU&lat=-0.23&lon=-78.52',
      };
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      return { error: 'Las coordenadas deben ser valores numéricos válidos.' };
    }

    return await this.populationService.getPopulationAtPoint(
      iso3.toUpperCase(),
      parsedLat,
      parsedLon,
      year,
    );
  }
}
