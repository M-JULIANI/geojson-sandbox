import { BooleanOps } from './booleanOps';
import type { PolygonFeature } from '@/types/types';

export enum PolygonOperation {
  UNION = 'UNION',
  INTERSECTION = 'INTERSECTION',
}

export const runUnion = (features: PolygonFeature[]) => {
  if (features.length < 2) return null;
  return BooleanOps.union(features);
};

export const runIntersection = (features: PolygonFeature[]) => {
  if (features.length < 2) return null;
  return BooleanOps.intersection(features);
};
