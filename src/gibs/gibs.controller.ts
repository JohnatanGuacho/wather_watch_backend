import { Controller, Get, Query } from '@nestjs/common';
import { GibsService } from './gibs.service';

@Controller('gibs')
export class GibsController {
  constructor(private readonly gibsService: GibsService) {}

  /**
   * Devuelve la lista de capas disponibles desde GIBS (XML -> texto)
   * Ejemplo: /api/gibs/capabilities
   */
  @Get('capabilities')
  async getCapabilities() {
    return this.gibsService.getCapabilities();
  }

  /**
   * Devuelve una imagen satelital en base a coordenadas, capa y fecha
   * Ejemplo:
   * /api/gibs/map?lat=-0.18&lon=-78.47&radius=0.1&layer=MODIS_Terra_CorrectedReflectance_TrueColor&date=2025-10-01
   */
  @Get('map')
  async getMap(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius = '0.5',
    @Query('layer') layer = 'MODIS_Terra_CorrectedReflectance_TrueColor',
    @Query('date') date = new Date().toISOString().split('T')[0],
  ) {
    return this.gibsService.getMap(lat, lon, radius, layer, date);
  }
}
