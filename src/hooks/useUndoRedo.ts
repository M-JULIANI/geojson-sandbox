import { useRef, useCallback } from 'react';
import { Patch } from 'immer';

// Define types for the history stack
type HistoryEntry<T = any> = {
  patches: Patch[];
  inversePatches: Patch[];
  metadata?: T;
};

interface UseUndoRedoOptions {
  maxHistorySize?: number;
}

interface UseUndoRedoResult {
  addToHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | undefined;
  redo: () => HistoryEntry | undefined;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

/**
 * A hook that provides undo/redo functionality using Immer patches
 */
export function useUndoRedo({ maxHistorySize = 100 }: UseUndoRedoOptions = {}): UseUndoRedoResult {
  // Store the history stack and current position
  const historyStack = useRef<HistoryEntry[]>([]);
  const pointer = useRef<number>(-1);

  // Add a new entry to the history stack
  const addToHistory = useCallback(
    (entry: HistoryEntry) => {
      // Truncate the redo history when a new action is performed
      historyStack.current = historyStack.current.slice(0, pointer.current + 1);

      // Add the new entry
      historyStack.current.push(entry);

      // Enforce maximum history size if needed
      if (maxHistorySize > 0 && historyStack.current.length > maxHistorySize) {
        const excess = historyStack.current.length - maxHistorySize;
        historyStack.current = historyStack.current.slice(excess);
        pointer.current = Math.max(0, pointer.current - excess);
      } else {
        pointer.current++;
      }
    },
    [maxHistorySize],
  );

  // Undo the last action
  const undo = useCallback(() => {
    if (pointer.current >= 0) {
      const entry = historyStack.current[pointer.current];
      pointer.current--;
      return entry;
    }
    return undefined;
  }, []);

  // Redo the previously undone action
  const redo = useCallback(() => {
    if (pointer.current < historyStack.current.length - 1) {
      pointer.current++;
      return historyStack.current[pointer.current];
    }
    return undefined;
  }, []);

  // Clear the history
  const clearHistory = useCallback(() => {
    historyStack.current = [];
    pointer.current = -1;
  }, []);

  // Calculate if undo/redo are available
  const canUndo = pointer.current >= 0;
  const canRedo = pointer.current < historyStack.current.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  };
}
