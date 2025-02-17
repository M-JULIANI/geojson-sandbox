import React, { useState, useRef, useEffect } from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import { useActiveSolution } from '@/contexts/ActiveSolutionContext';
import bbox from '@turf/bbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// You'll need to add your Mapbox token to your environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapView() {
  const { solution } = useActiveSolution();
  const mapRef = useRef<any>(null);
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<Set<number>>(new Set());

  // Calculate the bounding box of all features to set initial viewport
  const getBounds = () => {
    if (!solution?.features?.length) return null;
    return bbox({
      type: 'FeatureCollection',
      features: solution.features,
    });
  };

  const bounds = getBounds();

  // Add useEffect to handle recentering when solution changes
  useEffect(() => {
    const bounds = getBounds();
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: 200, duration: 1000 });
    }
  }, [solution]);

  const handleClick = (event: any) => {
    const features = event.features;
    if (!features?.length) {
      // Clicked empty space
      setSelectedFeatureIndices(new Set());
      return;
    }

    const clickedFeatureIndex = parseInt(features[0].properties.index);

    setSelectedFeatureIndices((prev) => {
      const newSelection = new Set(prev);
      if (event.originalEvent.shiftKey) {
        if (newSelection.has(clickedFeatureIndex)) {
          newSelection.delete(clickedFeatureIndex);
        } else {
          newSelection.add(clickedFeatureIndex);
        }
      } else {
        newSelection.clear();
        newSelection.add(clickedFeatureIndex);
      }
      return newSelection;
    });
  };

  // Add index to feature properties for selection
  const featuresWithIndex = solution?.features?.map((feature, index) => ({
    ...feature,
    properties: {
      ...feature.properties,
      index: index,
    },
  }));

  const geojson = {
    type: 'FeatureCollection',
    features: featuresWithIndex || [],
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={
        bounds
          ? {
              bounds: bounds,
              padding: 50,
            }
          : undefined
      }
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      interactiveLayerIds={['polygons-fill']}
      onClick={handleClick}
    >
      <Source type="geojson" data={geojson}>
        {/* Fill layer */}
        <Layer
          id="polygons-fill"
          type="fill"
          paint={{
            'fill-color': [
              'case',
              ['in', ['get', 'index'], ['literal', Array.from(selectedFeatureIndices)]],
              '#00ff00',
              '#cccccc',
            ],
            'fill-opacity': 0.5,
          }}
        />
        {/* Outline layer */}
        <Layer
          id="polygons-outline"
          type="line"
          paint={{
            'line-color': [
              'case',
              ['in', ['get', 'index'], ['literal', Array.from(selectedFeatureIndices)]],
              '#00ff00',
              '#0000ff',
            ],
            'line-width': 2,
          }}
        />
      </Source>
    </Map>
  );
}
