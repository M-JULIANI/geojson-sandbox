export interface PolygonFeature {
  type: 'Feature';
  properties: {
    id: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: PolygonFeature[];
}

export interface Solution extends FeatureCollection {
  id: string;
}
