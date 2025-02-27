import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Solution } from '@/types/types';
import { useSolutionList } from '@/contexts/SolutionListContext';
import { solutionReducer, SolutionAction } from '@/reducers/solutionReducer';
import { produceWithPatches, Patch, enablePatches } from 'immer';

enablePatches();

interface HistoryEntry {
  patches: Patch[];
  inversePatches: Patch[];
}

interface ActiveSolutionContextType {
  solution: Solution | null;
  dispatch: React.Dispatch<SolutionAction>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  selectedFeatureIndices: Set<number>;
  setSelectedFeatureIndices: (indices: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
}

const ActiveSolutionContext = createContext<ActiveSolutionContextType | undefined>(undefined);

export function ActiveSolutionProvider({ children }: { children: React.ReactNode }) {
  const { solutions = [], activeSolutionId, updateSolution } = useSolutionList();
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<Set<number>>(new Set());

  // History stack and pointer
  const undoStack = useRef<HistoryEntry[]>([]);
  const undoPointer = useRef<number>(-1);

  const activeSolution =
    solutions && Array.isArray(solutions) ? solutions.find((w) => w.id === activeSolutionId) || null : null;

  // Custom dispatch that handles history and updates the parent context
  const dispatch = (action: SolutionAction, undoable = true) => {
    if (!activeSolution) return;

    const [nextState, patches, inversePatches] = produceWithPatches(activeSolution, (draft) =>
      solutionReducer(draft, action),
    );

    // only update if there were actual changes
    if (patches.length > 0) {
      updateSolution(activeSolution.id, nextState);

      if (undoable) {
        // truncate the redo history when a new action is performed
        undoStack.current = undoStack.current.slice(0, undoPointer.current + 1);
        undoStack.current.push({ patches, inversePatches });
        undoPointer.current++;
      }
    }
  };

  const undo = () => {
    if (!activeSolution || undoPointer.current < 0) return;

    const patches = undoStack.current[undoPointer.current].inversePatches;
    undoPointer.current--;

    dispatch({ type: 'APPLY_PATCHES', patches }, false);
  };

  const redo = () => {
    if (!activeSolution || undoPointer.current >= undoStack.current.length - 1) return;

    undoPointer.current++;
    const patches = undoStack.current[undoPointer.current].patches;

    dispatch({ type: 'APPLY_PATCHES', patches }, false);
  };

  // Reset history when active solution changes
  useEffect(() => {
    undoStack.current = [];
    undoPointer.current = -1;
  }, [activeSolutionId]);

  const canUndo = undoPointer.current >= 0;
  const canRedo = undoPointer.current < undoStack.current.length - 1;

  return (
    <ActiveSolutionContext.Provider
      value={{
        solution: activeSolution,
        dispatch,
        canUndo,
        canRedo,
        undo,
        redo,
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
    throw new Error('useActiveSolution must be used within an ActiveSolutionProvider');
  }
  return context;
}
