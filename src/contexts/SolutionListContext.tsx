import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Solution } from '@/types/solution';

interface SolutionListContextType {
    solutions: Solution[];
    activeSolutionId: string | null;
    setActiveSolutionId: (id: string) => void;
    isLoading: boolean;
    error: Error | null;
}

const SolutionListContext = createContext<SolutionListContextType | undefined>(undefined);

export function SolutonListProvider({ children }: { children: React.ReactNode }) {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadWorkflows() {
            try {
                // In a real app, you might want to use import.meta.glob or fetch
                const workflow1 = await import('@/data/workflow1.json');
                const workflow2 = await import('@/data/workflow2.json');

                setSolutions([workflow1.default, workflow2.default]);
                // Optionally set the first workflow as active
                if (!activeSolutionId && workflow1.default.id) {
                    setActiveSolutionId(workflow1.default.id);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load workflows'));
            } finally {
                setIsLoading(false);
            }
        }

        loadWorkflows();
    }, []);

    return (
        <SolutionListContext.Provider value={{ solutions, activeSolutionId, setActiveSolutionId, isLoading, error }}>
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
