import { render, RenderOptions } from '@testing-library/react';
import { ActiveSolutionContext, ActiveSolutionContextType } from '@/contexts/ActiveSolutionContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  activeSolutionContextValue?: Partial<ActiveSolutionContextType>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { activeSolutionContextValue = {}, ...renderOptions }: CustomRenderOptions = {},
) {
  const defaultContextValue: ActiveSolutionContextType = {
    solution: { features: [], id: '1', type: 'FeatureCollection' },
    selectedFeatureIndices: new Set(),
    setSelectedFeatureIndices: () => {},
    updateFeatures: () => {},
    ...activeSolutionContextValue,
  };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ActiveSolutionContext.Provider value={defaultContextValue}>{children}</ActiveSolutionContext.Provider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
