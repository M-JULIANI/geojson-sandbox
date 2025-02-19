import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useActiveSolution } from '@/contexts/ActiveSolutionContext';
import { PolygonOperation } from '@/lib/geometry/geometryOps';

export function useMapInteractions() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { solution, selectedFeatureIndices, setSelectedFeatureIndices, updateFeatures } = useActiveSolution();

  const handleFeatureClick = useCallback(
    (index: number) => {
      setSelectedFeatureIndices((prev) => {
        const newSelection = new Set(prev);
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
        return newSelection;
      });
    },
    [setSelectedFeatureIndices],
  );

  const handleMapOperation = useCallback(
    (operation: PolygonOperation) => {
      if (selectedFeatureIndices.size === 2) {
        updateFeatures({
          type: operation,
          targetFeatureIndices: Array.from(selectedFeatureIndices),
        });
      }
    },
    [selectedFeatureIndices, updateFeatures],
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0],
      zoom: 1,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    setSelectedFeatureIndices(new Set());
  }, [solution, setSelectedFeatureIndices]);

  return {
    mapContainer,
    handleFeatureClick,
    handleMapOperation,
    showToolbar: selectedFeatureIndices.size === 2,
  };
}
