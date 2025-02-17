import React, { createContext, useContext } from 'react';
import type { Solution } from '@/types/solution';
import { useSolutionList } from '@/contexts/SolutionListContext';

interface ActiveWorkflowContextType {
    solution: Solution | null;
}

const ActiveWorkflowContext = createContext<ActiveWorkflowContextType | undefined>(undefined);

export function ActiveWorkflowProvider({ children }: { children: React.ReactNode }) {
    const { solutions, activeSolutionId } = useSolutionList();

    const activeSolution = solutions.find((w) => w.id === activeSolutionId) || null;

    return (
        <ActiveWorkflowContext.Provider
            value={{
                solution: activeSolution,
            }}
        >
            {children}
        </ActiveWorkflowContext.Provider>
    );
}

export function useActiveWorkflow() {
    const context = useContext(ActiveWorkflowContext);
    if (context === undefined) {
        throw new Error('useActiveWorkflow must be used within an ActiveWorkflowProvider');
    }
    return context;
}
