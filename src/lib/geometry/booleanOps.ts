import { union } from '@turf/union';
import { intersect } from '@turf/intersect';
import { Feature, MultiPolygon, Polygon } from 'geojson';

export class BooleanOps {
  /**
   * Performs a union operation on two or more polygons
   * @param polygons Array of GeoJSON Polygon or MultiPolygon features
   * @returns A single Feature containing the union of all polygons
   */
  static union(polygons: Feature<Polygon | MultiPolygon>[]): Feature<Polygon | MultiPolygon> | null {
    if (polygons.length === 0) return null;
    if (polygons.length === 1) return polygons[0];

    try {
      let result = polygons[0];
      for (let i = 1; i < polygons.length; i++) {
        const unionResult = union({
          type: 'FeatureCollection',
          features: [result, polygons[i]],
        });
        if (!unionResult) return null;
        result = unionResult;
      }
      return result;
    } catch (error) {
      console.error('Error performing union operation:', error);
      return null;
    }
  }

  /**
   * Performs an intersection operation on two or more polygons
   * @param polygons Array of GeoJSON Polygon or MultiPolygon features
   * @returns A Feature containing the intersection of all polygons
   */
  static intersection(polygons: Feature<Polygon | MultiPolygon>[]): Feature<Polygon | MultiPolygon> | null {
    if (polygons.length < 2) return null;

    try {
      let result = polygons[0];
      for (let i = 1; i < polygons.length; i++) {
        const intersectResult = intersect({ type: 'FeatureCollection', features: [result, polygons[i]] });
        if (!intersectResult) return null;
        result = intersectResult;
      }
      return result;
    } catch (error) {
      console.error('Error performing intersection operation:', error);
      return null;
    }
  }
}
