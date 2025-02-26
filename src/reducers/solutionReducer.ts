import type { Solution } from '../types/types';
import { BooleanOps } from '../lib/geometry/booleanOps';
import { PolygonOperation } from '../lib/geometry/geometryOps';
import type { Feature, Polygon } from 'geojson';
import { produce, applyPatches } from 'immer';
import { Patch } from 'immer';

export type SolutionAction =
  | { type: 'UPDATE_FEATURES'; operation: PolygonOperation; targetFeatureIndices: number[] }
  | { type: 'ADD_FEATURES'; features: Feature<Polygon>[] }
  | { type: 'DELETE_FEATURES'; featureIndices: number[] }
  | { type: 'APPLY_PATCHES'; patches: Patch[] };

// Operates on a single solution
export function solutionReducer(solution: Solution, action: SolutionAction): Solution {
  return produce(solution, (draft) => {
    switch (action.type) {
      case 'UPDATE_FEATURES': {
        const { operation, targetFeatureIndices } = action;
        const currentFeatures = draft.features;

        if (targetFeatureIndices.length < 2) return;

        switch (operation) {
          case PolygonOperation.UNION:
          case PolygonOperation.INTERSECTION: {
            const targetFeatures = targetFeatureIndices.map((i) => currentFeatures[i]);
            console.log('targetFeatures', targetFeatures);
            const result =
              operation === PolygonOperation.UNION
                ? BooleanOps.union(targetFeatures)
                : BooleanOps.intersection(targetFeatures);

            if (result) {
              // Remove original features and add the result
              draft.features = currentFeatures
                .filter((_, index) => !targetFeatureIndices.includes(index))
                .concat(result as Feature<Polygon>);
            }
            break;
          }
        }
        break;
      }

      case 'ADD_FEATURES': {
        draft.features = [...draft.features, ...action.features];
        break;
      }

      case 'DELETE_FEATURES': {
        draft.features = draft.features.filter((_, index) => !action.featureIndices.includes(index));
        break;
      }

      case 'APPLY_PATCHES': {
        return applyPatches(draft, action.patches);
      }
    }
  });
}
