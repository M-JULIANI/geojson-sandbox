import React, { createContext, useContext } from 'react';
import type { Solution } from '@/types/types';
import { useSolutionList } from '@/contexts/SolutionListContext';

interface ActiveSolutionContextType {
  solution: Solution | null;
}

const ActiveSolutionContext = createContext<ActiveSolutionContextType | undefined>(undefined);

export function ActiveSolutionProvider({ children }: { children: React.ReactNode }) {
  const { solutions = [], activeSolutionId } = useSolutionList();

  const activeSolution =
    solutions && Array.isArray(solutions) ? solutions.find((w) => w.id === activeSolutionId) || null : null;

  console.log('ActiveSolutionProvider render:', {
    solutionsLength: solutions?.length,
    activeSolutionId,
    hasActiveSolution: !!activeSolution,
  });

  return (
    <ActiveSolutionContext.Provider
      value={{
        solution: activeSolution,
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
