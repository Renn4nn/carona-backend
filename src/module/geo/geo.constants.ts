/**
 * Região atendida pelo autocomplete de endereços.
 *
 * O Geoapify só devolve resultados dentro do círculo (filter) e prioriza os
 * mais próximos do centro (bias). O padrão cobre Londrina, Cambé e Ibiporã.
 * Para atender outra cidade/universidade, defina no .env:
 *   GEO_REGION_LATITUDE, GEO_REGION_LONGITUDE, GEO_REGION_RADIUS_KM, GEO_COUNTRY_CODE
 */
export const DEFAULT_GEO_REGION = {
  latitude: -23.3103,
  longitude: -51.1628,
  radiusKm: 25,
  countryCode: 'br',
} as const;

export type GeoRegion = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  countryCode: string;
};
