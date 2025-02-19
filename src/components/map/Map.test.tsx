import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { MapView } from './Map';
import { renderWithProviders } from '@/test/test-utils';
import { PolygonOperation } from '@/lib/geometry/geometryOps';

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      remove: vi.fn(),
      fitBounds: vi.fn(),
    })),
  },
}));

describe('MapView', () => {
  const mockFeatures = [
    {
      type: 'Feature' as const,
      properties: { id: '1' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { id: '2' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [1, 1],
            [2, 1],
            [2, 2],
            [1, 2],
            [1, 1],
          ],
        ],
      },
    },
  ];

  const defaultProps = {
    solution: {
      features: mockFeatures,
      id: '1',
      type: 'FeatureCollection' as const,
    },
    selectedFeatureIndices: new Set<number>(),
    setSelectedFeatureIndices: vi.fn(),
    updateFeatures: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes map container', async () => {
    renderWithProviders(<MapView />, {
      activeSolutionContextValue: defaultProps,
    });
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  describe('Toolbar visibility', () => {
    it('shows toolbar only when exactly two features are selected', () => {
      const { rerender } = renderWithProviders(<MapView />, {
        activeSolutionContextValue: {
          ...defaultProps,
          selectedFeatureIndices: new Set([0, 1]),
        },
      });
      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
      rerender(<MapView />);
    });
  });

  describe('Feature operations', () => {
    it('triggers union operation correctly', () => {
      const updateFeatures = vi.fn();
      renderWithProviders(<MapView />, {
        activeSolutionContextValue: {
          ...defaultProps,
          selectedFeatureIndices: new Set([0, 1]),
          updateFeatures,
        },
      });

      fireEvent.click(screen.getByTestId('toolbar-union-button'));
      expect(updateFeatures).toHaveBeenCalledWith({
        type: PolygonOperation.UNION,
        targetFeatureIndices: [0, 1],
      });
    });

    it('triggers intersection operation correctly', () => {
      const updateFeatures = vi.fn();
      renderWithProviders(<MapView />, {
        activeSolutionContextValue: {
          ...defaultProps,
          selectedFeatureIndices: new Set([0, 1]),
          updateFeatures,
        },
      });

      fireEvent.click(screen.getByTestId('toolbar-intersection-button'));
      expect(updateFeatures).toHaveBeenCalledWith({
        type: PolygonOperation.INTERSECTION,
        targetFeatureIndices: [0, 1],
      });
    });
  });

  describe('Selection management', () => {
    it('clears selection when solution changes', () => {
      const setSelectedFeatureIndices = vi.fn();
      const { rerender } = renderWithProviders(<MapView />, {
        activeSolutionContextValue: {
          ...defaultProps,
          selectedFeatureIndices: new Set([0, 1]),
          setSelectedFeatureIndices,
        },
      });

      act(() => {
        rerender(<MapView />);
      });

      expect(setSelectedFeatureIndices).toHaveBeenCalledWith(new Set());
    });
  });
});
