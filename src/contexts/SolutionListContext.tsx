import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Solution } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

interface SolutionListContextType {
  solutions: Solution[];
  activeSolutionId: string | null;
  setActiveSolutionId: (id: string) => void;
  updateSolution: (solutionId: string, updatedSolution: Partial<Solution>) => void;
  isLoading: boolean;
  error: Error | null;
}

const SolutionListContext = createContext<SolutionListContextType | undefined>(undefined);

export function SolutionListProvider({ children }: { children: React.ReactNode }) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const updateSolution = useCallback((solutionId: string, updatedSolution: Partial<Solution>) => {
    setSolutions((prevSolutions) =>
      prevSolutions.map((solution) => (solution.id === solutionId ? { ...solution, ...updatedSolution } : solution)),
    );
  }, []);

  useEffect(() => {
    async function loadSolutions() {
      try {
        setIsLoading(true);
        const response1 = await fetch('../data/polygons1.json');
        const response2 = await fetch('../data/polygons2.json');

        const solution1 = await response1.json();
        const solution2 = await response2.json();

        const wrappedSolutions = [
          { id: uuidv4(), ...solution1 },
          { id: uuidv4(), ...solution2 },
        ];

        console.log('Setting solutions:', wrappedSolutions);
        setSolutions(wrappedSolutions);

        if (wrappedSolutions.length > 0) {
          setActiveSolutionId(wrappedSolutions[0].id);
        }
      } catch (err) {
        console.error('Error loading solutions:', err);
        setError(err instanceof Error ? err : new Error('Failed to load workflows'));
        setSolutions([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadSolutions();
  }, []);

  return (
    <SolutionListContext.Provider
      value={{
        solutions,
        activeSolutionId,
        setActiveSolutionId,
        updateSolution,
        isLoading,
        error,
      }}
    >
      {children}
    </SolutionListContext.Provider>
  );
}

export function useSolutionList() {
  const context = useContext(SolutionListContext);
  if (context === undefined) {
    throw new Error('useSolutionList must be used within a SolutionListProvider');
  }
  return context;
}
