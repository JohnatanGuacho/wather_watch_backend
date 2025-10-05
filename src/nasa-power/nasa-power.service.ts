import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NasaPowerService {
  constructor(private readonly http: HttpService) {}

  /**
   * Obtiene datos diarios de temperatura (T2M) y precipitación (PRECTOT)
   * desde la API NASA POWER.
   */
  async getDailyClimate(lat: number, lon: number, start: string, end: string) {
    const baseUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point';
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      start,
      end,
      community: 'RE', // Renewable Energy community

      //LOS PARAMETROS QUE VOY A OBTENER.
      //TEMOPERATURA, PRECIPITACIONES, HUMEDAD RELATIVA, RADIACION SOLAR.
      parameters: 'T2M,PRECTOT, RH2M, ALLSKY_SFC_SW_DWN',
      format: 'JSON',
    });

    const url = `${baseUrl}?${params.toString()}`;

    try {
      const { data } = await firstValueFrom(this.http.get(url));

      const properties = data?.properties?.parameter ?? {};

      return {
        provider: 'NASA POWER',
        location: { lat, lon },
        range: { start, end },
        parameters: Object.keys(properties),
        data: properties,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Error consultando NASA POWER API',
        details: err?.message ?? err,
      });
    }
  }
}
