import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PrecipitacionService {
  constructor(private readonly http: HttpService) {}

  async getDailySeries(lat: number, lon: number, days = 7) {
    // Proveedor rápido y sin API key: Open-Meteo
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=precipitation_sum&past_days=${days}&timezone=auto`;

    const { data } = await firstValueFrom(this.http.get(url));

    if (!data?.daily?.time || !data?.daily?.precipitation_sum) {
      return {
        provider: 'open-meteo',
        location: { lat, lon },
        range: { days, start: null, end: null },
        total_mm: 0,
        series: [],
      };
    }

    const series = data.daily.time.map((date: string, i: number) => ({
      date,
      mm: Number(data.daily.precipitation_sum[i] ?? 0),
    }));

    const total_mm = series.reduce((acc: number, d: any) => acc + d.mm, 0);

    return {
      provider: 'open-meteo',
      location: { lat, lon },
      range: {
        days,
        start: series[0]?.date ?? null,
        end: series[series.length - 1]?.date ?? null,
      },
      total_mm: Number(total_mm.toFixed(2)),
      series,
    };
  }
}
