import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Tipado laxo para evitar problemas de types con require()
/* eslint-disable @typescript-eslint/no-var-requires */
const osmtogeojson = require('osmtogeojson');

@Injectable()
export class WaterService {
  constructor(private readonly http: HttpService) {}

  async getBodies(lat: number, lon: number, radiusKm = 10) {
    const radiusM = Math.round(radiusKm * 1000);

    // Overpass API: buscamos natural=water, water=*, waterway=* alrededor del punto
    // Docs/ejemplos: https://wiki.openstreetmap.org/wiki/Overpass_API  /  Overpass API by Example
    // Resultado en JSON (OSM), luego convertimos a GeoJSON para el frontend.
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:25];
      (
        way(around:${radiusM},${lat},${lon})["natural"="water"];
        relation(around:${radiusM},${lat},${lon})["natural"="water"];
        way(around:${radiusM},${lat},${lon})["water"];
        relation(around:${radiusM},${lat},${lon})["water"];
        way(around:${radiusM},${lat},${lon})["waterway"];
        relation(around:${radiusM},${lat},${lon})["waterway"];
      );
      out body; >; out skel qt;
    `;

    try {
      const { data } = await firstValueFrom(
        this.http.post(overpassUrl, query, {
          headers: { 'Content-Type': 'text/plain' },
        }),
      );

      // Convierte OSM JSON → GeoJSON FeatureCollection
      const geojson = osmtogeojson(data);
      const features = geojson?.features ?? [];

      return {
        provider: 'overpass',
        location: { lat, lon },
        radiusKm,
        count: features.length,
        geojson, // FeatureCollection
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Error consultando Overpass API',
        details: err?.message ?? err,
      });
    }
  }
}
