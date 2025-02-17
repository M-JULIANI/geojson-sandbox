import React, { useEffect, useState } from 'react';
import { Stage, Graphics } from '@pixi/react';
import { useActiveSolution } from '@/contexts/ActiveSolutionContext';

type Coordinate = [number, number];

interface Feature {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'Polygon';
    coordinates: Coordinate[][];
  };
}

export function Canvas() {
  const { solution } = useActiveSolution();
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<Set<number>>(new Set());

  // Handle container resizing
  useEffect(() => {
    const resizeObserver = new ResizeObserver((event) => {
      setWidth(event[0].contentBoxSize[0].inlineSize);
      setHeight(event[0].contentBoxSize[0].blockSize);
    });

    const container = document.getElementById('canvas-container');
    if (container) {
      resizeObserver.observe(container);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const doPolygonsOverlap = (poly1: Coordinate[][], poly2: Coordinate[][]): boolean => {
    // Simple bounding box check for now
    const bbox1 = getBoundingBox(poly1[0]);
    const bbox2 = getBoundingBox(poly2[0]);

    return !(bbox1.maxX < bbox2.minX || bbox1.minX > bbox2.maxX || bbox1.maxY < bbox2.minY || bbox1.minY > bbox2.maxY);
  };

  const getBoundingBox = (coords: Coordinate[]) => {
    const xs = coords.map((c) => c[0]);
    const ys = coords.map((c) => c[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  };

  const isPointInPolygon = (point: Coordinate, polygon: Coordinate[]): boolean => {
    // Ray casting algorithm
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];

      const intersect = yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleClick = (event: any) => {
    if (!solution?.features) return;

    const point: Coordinate = [event.clientX, event.clientY];
    let clickedFeatureIndex: number | null = null;

    // Find clicked feature
    for (let i = 0; i < solution.features.length; i++) {
      if (isPointInPolygon(point, solution.features[i].geometry.coordinates[0])) {
        clickedFeatureIndex = i;
        break;
      }
    }

    // Handle selection
    if (clickedFeatureIndex !== null) {
      setSelectedFeatureIndices((prev) => {
        const newSelection = new Set(prev);
        if (event.shiftKey) {
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
    } else if (!event.shiftKey) {
      setSelectedFeatureIndices(new Set());
    }
  };

  const renderFeature = (feature: Feature, index: number) => {
    if (!solution?.features) return null;

    const isSelected = selectedFeatureIndices.has(index);
    const hasOverlap =
      isSelected &&
      Array.from(selectedFeatureIndices).some((idx) => {
        return (
          idx !== index && doPolygonsOverlap(feature.geometry.coordinates, solution.features[idx].geometry.coordinates)
        );
      });

    return (
      <Graphics
        key={index}
        draw={(g) => {
          g.clear();
          g.lineStyle(2, hasOverlap ? 0xff0000 : isSelected ? 0x00ff00 : 0x0000ff, 1);
          g.beginFill(0xcccccc, 0.5);

          const coords = feature.geometry.coordinates[0];
          g.moveTo(coords[0][0], coords[0][1]);
          coords.forEach((coord) => {
            g.lineTo(coord[0], coord[1]);
          });

          g.endFill();
        }}
      />
    );
  };

  return (
    <div id="canvas-container" style={{ width: '100%', height: '100%' }}>
      <Stage width={width} height={height} options={{ backgroundColor: '0xFFFFFF' }} onClick={handleClick}>
        {solution?.features?.map((feature, index) => renderFeature(feature, index))}
      </Stage>
    </div>
  );
}
