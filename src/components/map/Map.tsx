import { FC } from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { useMapInteractions } from './useMapInteractions';
import { PolygonOperation } from '@/lib/geometry/geometryOps';

export const MapView: FC = () => {
  const { mapContainer, handleFeatureClick, handleMapOperation, showToolbar } = useMapInteractions();

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} data-testid="map-container" className="absolute inset-0" />
      {showToolbar && (
        <Toolbar
          booleanOperationsAvailable={true}
          onUnion={() => handleMapOperation(PolygonOperation.UNION)}
          onIntersection={() => handleMapOperation(PolygonOperation.INTERSECTION)}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};
