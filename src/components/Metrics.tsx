import { useActiveSolution } from '@/contexts/ActiveSolutionContext';
import { area } from '@turf/area';

const formatArea = (areaInSquareMeters: number) => {
  return `${areaInSquareMeters.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²`;
};

export function Metrics() {
  const { solution, selectedFeatureIndices, setSelectedFeatureIndices } = useActiveSolution();

  if (!solution?.features?.length) {
    return <div className="p-4 text-gray-500">No active solution selected</div>;
  }

  const selectedFeatures = Array.from(selectedFeatureIndices).map((index) => solution.features[index]);

  const calculateArea = (features: typeof solution.features) => {
    return features.reduce((sum, feature) => sum + area(feature), 0);
  };

  const totalArea = calculateArea(solution.features);
  const selectedArea = calculateArea(selectedFeatures);

  const handleFeatureClick = (index: number) => {
    setSelectedFeatureIndices((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      return newSelection;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Summary Stats Section */}
      <div className="p-4 border-b">
        <h2 className="text-2xl mb-4">Statistics</h2>
        <div className="space-y-2">
          {selectedFeatureIndices.size > 0 ? (
            <>
              <div className="font-medium">Selected Features: {selectedFeatureIndices.size}</div>
              <div className="text-gray-600">Area: {formatArea(selectedArea)}</div>
            </>
          ) : (
            <>
              <div className="font-medium">Total Features: {solution.features.length}</div>
              <div className="text-gray-600">Total Area: {formatArea(totalArea)}</div>
            </>
          )}
        </div>
      </div>

      {/* Feature List Section */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h3 className="font-medium mb-2">Features</h3>
          <div className="space-y-2">
            {solution.features.map((feature, index) => (
              <div
                key={index}
                className={`p-2 rounded cursor-pointer transition-colors
                  ${selectedFeatureIndices.has(index) ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-gray-100'}`}
                onClick={() => handleFeatureClick(index)}
              >
                <div className="font-medium">Feature {index + 1}</div>
                <div className="text-sm text-gray-600">Area: {formatArea(area(feature))}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
