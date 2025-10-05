import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(private readonly http: HttpService) {}

  async analyzePoint(lat: number, lon: number, iso3 = 'ECU') {
    // 🔹 Validar año (WorldPop llega hasta 2020)
    const availableYear = 2020;
    const date = '2025-09-28';

    // 🔹 APIs locales y externas
    const endpoints = {
      // ✅ Población nacional (WorldPop)
      population: `http://localhost:3000/api/population/country?iso3=${iso3}&year=${availableYear}`,

      // ✅ Clima (NASA POWER)
      climate: `https://power.larc.nasa.gov/api/temporal/daily/point?start=20250101&end=20250107&latitude=${lat}&longitude=${lon}&community=RE&parameters=T2M,PRECTOTCORR&format=JSON`,

      // ✅ Cuerpos de agua (Overpass API)
      water: `http://localhost:3000/api/water/bodies?lat=${lat}&lon=${lon}&radiusKm=5`,

      // ✅ Imágenes satelitales (NASA GIBS)
      gibs: `http://localhost:3000/api/gibs/map?lat=${lat}&lon=${lon}&radius=1.5&layer=MODIS_Terra_CorrectedReflectance_TrueColor&date=${date}`,
    };

    // 🔸 Ejecutar todas las consultas tolerando errores
    const tasks = Object.entries(endpoints).map(async ([key, url]) => {
      try {
        const res = await firstValueFrom(
          this.http.get(url).pipe(
            timeout(15000),
            catchError((err) => {
              this.logger.warn(`⚠️ Error en ${key}: ${err.message}`);
              return of({ data: { error: err.message || 'Fallo en la API' } });
            }),
          ),
        );
        return { key, data: res.data };
      } catch (err) {
        return { key, data: { error: err.message || 'Fallo inesperado' } };
      }
    });

    // ✅ Esperar todas las respuestas (aunque alguna falle)
    const results = await Promise.allSettled(tasks);

    const combined: Record<string, any> = {};
    for (const result of results) {
      if (result.status === 'fulfilled') {
        combined[result.value.key] = result.value.data;
      } else {
        combined[result.reason?.key || 'unknown'] = { error: 'Fallo interno' };
      }
    }

    return {
      location: { lat, lon, iso3 },
      ...combined,
    };
  }
}
