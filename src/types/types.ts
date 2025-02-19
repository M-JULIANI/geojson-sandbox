import type { Feature, Polygon, FeatureCollection } from 'geojson';

export type PolygonFeature = Feature<Polygon, { id: string } & Record<string, any>>;

export interface Solution extends FeatureCollection<Polygon> {
  id: string;
}
