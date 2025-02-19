import React, { createContext, useContext, useCallback, useState } from 'react';
import type { Solution } from '@/types/types';
import { useSolutionList } from '@/contexts/SolutionListContext';
import { BooleanOps } from '../lib/geometry/booleanOps';
import type { Feature, Polygon } from 'geojson';
import { PolygonOperation } from '@/lib/geometry/geometryOps';

interface ActiveSolutionContextType {
  solution: Solution | null;
  updateFeatures: (operation: {
    type: PolygonOperation;
    targetFeatureIndices?: number[];
    newFeatures?: GeoJSON.Feature[];
  }) => void;
  selectedFeatureIndices: Set<number>;
  setSelectedFeatureIndices: (indices: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
}

const ActiveSolutionContext = createContext<ActiveSolutionContextType | undefined>(undefined);

export function ActiveSolutionProvider({ children }: { children: React.ReactNode }) {
  const { solutions = [], activeSolutionId, updateSolution } = useSolutionList();
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<Set<number>>(new Set());

  const activeSolution =
    solutions && Array.isArray(solutions) ? solutions.find((w) => w.id === activeSolutionId) || null : null;

  const updateFeatures = useCallback(
    (operation: { type: PolygonOperation; targetFeatureIndices?: number[]; newFeatures?: GeoJSON.Feature[] }) => {
      if (!activeSolution) return;

      const currentFeatures = activeSolution.features;
      let updatedFeatures: GeoJSON.Feature[] = [];

      switch (operation.type) {
        case PolygonOperation.UNION:
        case PolygonOperation.INTERSECTION: {
          if (!operation.targetFeatureIndices || operation.targetFeatureIndices.length < 2) return;

          const targetFeatures = operation.targetFeatureIndices.map((i) => currentFeatures[i]);
          const result =
            operation.type === PolygonOperation.UNION
              ? BooleanOps.union(targetFeatures)
              : BooleanOps.intersection(targetFeatures);

          //remove the original features and add the result
          if (result) {
            updatedFeatures = currentFeatures.filter(
              (_, index: number) => !operation.targetFeatureIndices?.includes(index),
            );
            updatedFeatures.push(result as GeoJSON.Feature);
          }
          break;
        }
      }

      updateSolution(activeSolution.id, {
        ...activeSolution,
        features: updatedFeatures.map((feature) => ({
          ...feature,
        })) as Feature<Polygon>[],
      });
    },
    [activeSolution, updateSolution],
  );

  return (
    <ActiveSolutionContext.Provider
      value={{
        solution: activeSolution,
        updateFeatures,
        selectedFeatureIndices,
        setSelectedFeatureIndices,
      }}
    >
      {children}
    </ActiveSolutionContext.Provider>
  );
}

export function useActiveSolution() {
  const context = useContext(ActiveSolutionContext);
  if (context === undefined) {
    throw new Error('useActiveWorkflow must be used within an ActiveWorkflowProvider');
  }
  return context;
}
