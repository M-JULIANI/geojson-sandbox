import React, { createContext, useContext, useCallback } from 'react';
import type { Solution } from '@/types/types';
import { useSolutionList } from '@/contexts/SolutionListContext';
import { BooleanOps } from '../../lib/geometry/booleanOps';
import type { PolygonFeature } from '@/types/types';
interface ActiveSolutionContextType {
  solution: Solution | null;
  updateFeatures: (operation: {
    type: 'UNION' | 'INTERSECTION';
    targetFeatureIndices?: number[];
    newFeatures?: GeoJSON.Feature[];
  }) => void;
}

const ActiveSolutionContext = createContext<ActiveSolutionContextType | undefined>(undefined);

export function ActiveSolutionProvider({ children }: { children: React.ReactNode }) {
  const { solutions = [], activeSolutionId, updateSolution } = useSolutionList();

  const activeSolution =
    solutions && Array.isArray(solutions) ? solutions.find((w) => w.id === activeSolutionId) || null : null;

  const updateFeatures = useCallback(
    (operation: {
      type: 'UNION' | 'INTERSECTION';
      targetFeatureIndices?: number[];
      newFeatures?: GeoJSON.Feature[];
    }) => {
      if (!activeSolution) return;

      const currentFeatures = activeSolution.features;
      let updatedFeatures: GeoJSON.Feature[] = [];

      switch (operation.type) {
        case 'UNION':
        case 'INTERSECTION': {
          if (!operation.targetFeatureIndices || operation.targetFeatureIndices.length < 2) return;

          const targetFeatures = operation.targetFeatureIndices.map((i) => currentFeatures[i]);
          const result =
            operation.type === 'UNION' ? BooleanOps.union(targetFeatures) : BooleanOps.intersection(targetFeatures);

          // Remove the original features and add the result
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
          properties: {
            ...feature.properties,
            id: crypto.randomUUID(),
          },
        })) as PolygonFeature[],
      });
    },
    [activeSolution, updateSolution],
  );

  console.log('ActiveSolutionProvider render:', {
    solutionsLength: solutions?.length,
    activeSolutionId,
    hasActiveSolution: !!activeSolution,
  });

  return (
    <ActiveSolutionContext.Provider
      value={{
        solution: activeSolution,
        updateFeatures,
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
