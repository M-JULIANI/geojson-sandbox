import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Solution } from '@/types/types';
import { useSolutionList } from '@/contexts/SolutionListContext';
import { solutionReducer, SolutionAction } from '@/reducers/solutionReducer';
import { produceWithPatches, Patch, enablePatches, applyPatches } from 'immer';
import { useUndoRedo } from '../hooks/useUndoRedo';

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

export const ActiveSolutionContext = createContext<ActiveSolutionContextType | undefined>(undefined);

export const ActiveSolutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { solutions = [], activeSolutionId, updateSolution } = useSolutionList();
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<Set<number>>(new Set());

  // History stack and pointer
  const undoStack = useRef<HistoryEntry[]>([]);
  const undoPointer = useRef<number>(-1);

  const activeSolution =
    solutions && Array.isArray(solutions) ? solutions.find((w) => w.id === activeSolutionId) || null : null;

  // Use our new hook instead of managing undo/redo directly
  const { addToHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useUndoRedo();

  // Custom dispatch that handles history and updates the parent context
  const dispatch = useCallback(
    (action: SolutionAction, undoable = true) => {
      if (!activeSolution) return;

      const [nextState, patches, inversePatches] = produceWithPatches(activeSolution, (draft) =>
        solutionReducer(draft, action),
      );

      // only update if there were actual changes
      if (patches.length > 0) {
        updateSolution(activeSolution.id, nextState);

        if (undoable) {
          // Add to history using our hook
          addToHistory({ patches, inversePatches });
        }
      }
    },
    [activeSolution, updateSolution, addToHistory],
  );

  // Undo the last action
  const undo = useCallback(() => {
    if (!activeSolution || !canUndo) return;

    const entry = undoHistory();
    if (entry) {
      const nextState = applyPatches(activeSolution, entry.inversePatches);
      updateSolution(activeSolution.id, nextState);
    }
  }, [activeSolution, updateSolution, undoHistory, canUndo]);

  // Redo the previously undone action
  const redo = useCallback(() => {
    if (!activeSolution || !canRedo) return;

    const entry = redoHistory();
    if (entry) {
      const nextState = applyPatches(activeSolution, entry.patches);
      updateSolution(activeSolution.id, nextState);
    }
  }, [activeSolution, updateSolution, redoHistory, canRedo]);

  // Reset history when active solution changes
  useEffect(() => {
    undoStack.current = [];
    undoPointer.current = -1;
  }, [activeSolutionId]);

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
};

export function useActiveSolution() {
  const context = useContext(ActiveSolutionContext);
  if (context === undefined) {
    throw new Error('useActiveSolution must be used within an ActiveSolutionProvider');
  }
  return context;
}
