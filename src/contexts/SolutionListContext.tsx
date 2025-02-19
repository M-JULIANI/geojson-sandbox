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
        const fileNumbers = [1, 2];
        const responses = await Promise.all(
          fileNumbers.map(async (num) => {
            try {
              const response = await fetch(`../data/polygons${num}.json`);
              if (!response.ok) return null;
              const data = await response.json();
              return { id: uuidv4(), ...data };
            } catch {
              return null;
            }
          }),
        );

        const wrappedSolutions = responses.filter((solution): solution is Solution => solution !== null);

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
