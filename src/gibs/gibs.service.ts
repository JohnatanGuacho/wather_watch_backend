import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GibsService {
  private readonly baseUrl =
    'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

  /**
   * Devuelve la lista de capas (en XML)
   */
  async getCapabilities() {
    try {
      const url = `${this.baseUrl}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0`;
      const { data } = await axios.get(url);
      return {
        message: 'Capas disponibles obtenidas desde NASA GIBS 🌍',
        source: url,
        data,
      };
    } catch (error) {
      return {
        message: 'Error obteniendo capas desde NASA GIBS',
        details: error.message,
      };
    }
  }

  /**
   * Devuelve un enlace con la imagen satelital
   */
  async getMap(
    lat: string,
    lon: string,
    radius: string,
    layer: string,
    date: string,
  ) {
    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    const r = parseFloat(radius);

    // Calcular área alrededor del punto (en grados)
    const minLat = latF - r;
    const maxLat = latF + r;
    const minLon = lonF - r;
    const maxLon = lonF + r;

    // Construir la URL
    const imageUrl = `${this.baseUrl}?SERVICE=WMS&REQUEST=GetMap&LAYERS=${layer}&CRS=EPSG:4326&BBOX=${minLat},${minLon},${maxLat},${maxLon}&WIDTH=1024&HEIGHT=512&FORMAT=image/jpeg&TIME=${date}&VERSION=1.3.0`;

    return {
      provider: 'NASA GIBS',
      layer,
      date,
      coords: { lat: latF, lon: lonF },
      bbox: { minLat, minLon, maxLat, maxLon },
      imageUrl,
    };
  }
}
