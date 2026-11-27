import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import z from 'zod';
import { DEFAULT_GEO_REGION, type GeoRegion } from './geo.constants';

const autocompleteResponseSchema = z.object({
  results: z.array(
    z.object({
      place_id: z.union([z.string(), z.number()]).transform(String),
      formatted: z.string(),
      lat: z.number(),
      lon: z.number(),
    }),
  ),
});

const routeResponseSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.string(),
      geometry: z.unknown(),
      properties: z.record(z.string(), z.unknown()),
    }),
  ),
});

@Injectable()
export class GeoService {
  constructor(private readonly config: ConfigService) {}

  async autocomplete(query: string) {
    const key = this.config.get<string>('GEOAPIFY_SERVER_KEY');
    if (!key) throw new BadGatewayException('Geocodificação não configurada.');
    const region = this.region();
    const params = new URLSearchParams({
      text: query,
      format: 'json',
      limit: '5',
      lang: 'pt',
      // O Geoapify espera longitude antes da latitude; raio em metros.
      filter: `circle:${region.longitude},${region.latitude},${region.radiusKm * 1000}|countrycode:${region.countryCode}`,
      bias: `proximity:${region.longitude},${region.latitude}`,
      apiKey: key,
    });
    const result = await this.getJson(
      `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
    );
    const parsed = autocompleteResponseSchema.safeParse(result);
    if (!parsed.success)
      throw new BadGatewayException(
        'Resposta inválida do serviço de endereços.',
      );
    return parsed.data.results.map((item) => ({
      id: item.place_id,
      label: item.formatted,
      latitude: item.lat,
      longitude: item.lon,
    }));
  }

  async route(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) {
    const key = this.config.get<string>('GEOAPIFY_SERVER_KEY');
    if (!key) throw new BadGatewayException('Rotas não configuradas.');
    const params = new URLSearchParams({
      waypoints: `${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}`,
      mode: 'drive',
      format: 'geojson',
      apiKey: key,
    });
    const result = await this.getJson(
      `https://api.geoapify.com/v1/routing?${params}`,
    );
    const parsed = routeResponseSchema.safeParse(result);
    if (!parsed.success)
      throw new BadGatewayException('Resposta inválida do serviço de rotas.');
    const properties = parsed.data.features[0]?.properties ?? {};
    return {
      geometry: parsed.data,
      distanceMeters:
        typeof properties.distance === 'number' ? properties.distance : null,
      durationSeconds:
        typeof properties.time === 'number' ? properties.time : null,
    };
  }

  private region(): GeoRegion {
    const number = (name: string, fallback: number) => {
      const value = Number(this.config.get<string>(name));
      return Number.isFinite(value) && value !== 0 ? value : fallback;
    };
    return {
      latitude: number('GEO_REGION_LATITUDE', DEFAULT_GEO_REGION.latitude),
      longitude: number('GEO_REGION_LONGITUDE', DEFAULT_GEO_REGION.longitude),
      radiusKm: number('GEO_REGION_RADIUS_KM', DEFAULT_GEO_REGION.radiusKm),
      countryCode:
        this.config.get<string>('GEO_COUNTRY_CODE') ||
        DEFAULT_GEO_REGION.countryCode,
    };
  }

  private async getJson(url: string) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5_000),
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CaronaUniversitaria/1.0',
        },
      });
      if (response.status === 401 || response.status === 403) {
        throw new BadGatewayException(
          'A chave do Geoapify é inválida ou não possui acesso a esta API.',
        );
      }
      if (response.status === 429) {
        throw new BadGatewayException(
          'O limite de consultas do serviço de mapas foi atingido. Tente novamente em instantes.',
        );
      }
      if (!response.ok) throw new Error(`Geoapify returned ${response.status}`);
      return (await response.json()) as unknown;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException(
        'Serviço de mapas temporariamente indisponível.',
      );
    }
  }
}
