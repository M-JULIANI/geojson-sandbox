import { useState, useRef, useEffect } from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import { useActiveSolution } from '@/contexts/ActiveSolutionContext';
import bbox from '@turf/bbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Toolbar } from './Toolbar';
import { PolygonOperation } from '@/lib/geometry/geometryOps';

// You'll need to add your Mapbox token to your environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapView() {
  const { solution, dispatch, selectedFeatureIndices, setSelectedFeatureIndices, canUndo, canRedo, undo, redo } =
    useActiveSolution();
  const mapRef = useRef<any>(null);
  const [boolOpsAvailable, setBoolOpsAvailable] = useState(false);

  // Calculate the bounding box of all features to set initial viewport
  const getBounds = () => {
    if (!solution?.features?.length) return null;
    const [minX, minY, maxX, maxY] = bbox({
      type: 'FeatureCollection',
      features: solution.features,
    });
    return [
      [minX, minY],
      [maxX, maxY],
    ] as [[number, number], [number, number]];
  };

  const bounds = getBounds();

  useEffect(() => {
    setBoolOpsAvailable(selectedFeatureIndices && selectedFeatureIndices.size >= 2);
  }, [selectedFeatureIndices]);

  // Add useEffect to handle recentering when solution changes
  useEffect(() => {
    const bounds = getBounds();
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: 200, duration: 1000 });
    }
    // Clear selected features when solution changes
    setSelectedFeatureIndices(new Set());
    setBoolOpsAvailable(false);
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

      // Always use multi-select behavior
      if (newSelection.has(clickedFeatureIndex)) {
        newSelection.delete(clickedFeatureIndex);
      } else {
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

  const handleUnion = () => {
    if (boolOpsAvailable) {
      const features = Array.from(selectedFeatureIndices);
      // Implement union operation
      dispatch({
        type: 'UPDATE_FEATURES',
        operation: PolygonOperation.UNION,
        targetFeatureIndices: [...features],
      });
      console.log('Union operation ran');
    }
    setSelectedFeatureIndices(new Set());
  };

  const handleIntersection = () => {
    if (boolOpsAvailable) {
      const features = Array.from(selectedFeatureIndices);
      // Implement union operation
      dispatch({
        type: 'UPDATE_FEATURES',
        operation: PolygonOperation.INTERSECTION,
        targetFeatureIndices: [...features],
      });
      console.log('Intersection operation ran');
    }
    setSelectedFeatureIndices(new Set());
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        initialViewState={
          bounds
            ? {
                bounds: bounds,
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
      {(boolOpsAvailable || canUndo || canRedo) && (
        <Toolbar
          booleanOperationsAvailable={boolOpsAvailable}
          onUnion={handleUnion}
          onIntersection={handleIntersection}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      )}
    </div>
  );
}
