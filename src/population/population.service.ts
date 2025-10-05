import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { fromUrl } from 'geotiff';

@Injectable()
export class PopulationService {
  private readonly baseUrl = 'https://hub.worldpop.org/rest/data/pop';
  private readonly logger = new Logger(PopulationService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Consulta datos de población por país usando la API hub.worldpop.org
   */
  async getPopulationByCountry(
    iso3: string,
    year?: string,
    project = 'wpgp',
  ): Promise<any> {
    const url = `${this.baseUrl}/${project}?iso3=${iso3}`;
    this.logger.debug(`Requesting WorldPop URL: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'NestJS-WorldPop-Module',
            'Accept': 'application/json',
          },
          timeout: 15000,
        }),
      );

      const data = response.data?.data || [];
      if (!data.length) throw new Error('No se encontraron datos');

      if (year) {
        const filtered = data.find((item) => item.popyear === year);
        if (!filtered) {
          return {
            message: `No se encontró información para el año ${year}. Años disponibles: ${data
              .map((d) => d.popyear)
              .join(', ')}`,
          };
        }
        return filtered;
      }

      return {
        iso3,
        total_records: data.length,
        available_years: data.map((d) => d.popyear),
        samples: data.slice(-3),
      };
    } catch (error) {
      this.logger.error(`Error al consultar WorldPop: ${error.message}`);
      throw new HttpException(
        `No se pudo obtener la información de población para ${iso3}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Obtiene la densidad de población estimada para una coordenada específica (lat/lon)
   */
  async getPopulationAtPoint(
    iso3: string,
    lat: number,
    lon: number,
    year = '2020',
  ): Promise<any> {
    this.logger.debug(`Obteniendo densidad poblacional para ${iso3} en (${lat}, ${lon})`);

    const iso = iso3.toUpperCase();
    const tiffUrl = `https://data.worldpop.org/GIS/Population/Global_2000_2020/${year}/${iso}/${iso.toLowerCase()}_ppp_${year}.tif`;

    try {
      const tiff = await fromUrl(tiffUrl);
      const image = await tiff.getImage();

      const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]
      const [minLon, minLat, maxLon, maxLat] = bbox;

      this.logger.debug(`BoundingBox de ${iso}: ${bbox}`);

      // Validar si la coordenada está dentro del rango del raster
      if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) {
        throw new Error(
          `Las coordenadas (${lat}, ${lon}) están fuera del rango del mapa (${minLat} a ${maxLat}, ${minLon} a ${maxLon}).`,
        );
      }

      const [pixelWidth, pixelHeight] = image.getResolution();
      const [originX, originY] = image.getOrigin();

      // Ajuste: pixelHeight casi siempre es positivo, pero debe considerarse invertido
      const correctedPixelHeight = pixelHeight > 0 ? -pixelHeight : pixelHeight;

      // Cálculo corregido de coordenadas de píxel
      const x = Math.floor((lon - originX) / pixelWidth);
      const y = Math.floor((originY - lat) / Math.abs(correctedPixelHeight));

      const width = image.getWidth();
      const height = image.getHeight();

      if (x < 0 || y < 0 || x >= width || y >= height) {
        throw new Error(`Coordenadas (${x}, ${y}) fuera del rango del raster (${width}x${height}).`);
      }

      const raster = await image.readRasters({ window: [x, y, x + 1, y + 1] });
      const value = raster[0][0];

      if (value === undefined || isNaN(value)) {
        throw new Error('No se pudo leer el valor de densidad en el punto.');
      }

      return {
        iso3: iso,
        year,
        lat,
        lon,
        population_density: value,
        units: 'people per pixel (~100m)',
        bbox: { minLon, minLat, maxLon, maxLat },
        source: tiffUrl,
      };
    } catch (error) {
      this.logger.error(`Error procesando GeoTIFF (${iso3}): ${error.message}`);
      throw new HttpException(
        `No se pudo calcular la densidad poblacional para ${iso3} en (${lat}, ${lon}).`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
