import { useActiveSolution } from '@/contexts/ActiveSolutionContext';
import { area } from '@turf/area';

const formatArea = (areaInSquareMeters: number) => {
  return `${areaInSquareMeters.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²`;
};

// Create a type for the props
interface MetricsProps {
  features: any[]; // Replace 'any' with your actual feature type
  selectedIndices: Set<number>;
  onSelectionChange: (indices: Set<number>) => void;
}

// Convert to accept props instead of using context directly
export function Metrics({ features, selectedIndices, onSelectionChange }: MetricsProps) {
  if (!features?.length) {
    return <div className="p-4 text-gray-500">No active solution selected</div>;
  }

  const selectedFeatures = Array.from(selectedIndices).map((index) => features[index]);

  const calculateArea = (featuresToCalculate: typeof features) => {
    return featuresToCalculate.reduce((sum, feature) => sum + area(feature as any), 0);
  };

  const totalArea = calculateArea(features);
  const selectedArea = calculateArea(selectedFeatures);

  const handleFeatureClick = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    onSelectionChange(newSelection);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Summary Stats Section */}
      <div className="p-4 border-b">
        <h2 className="text-2xl mb-4">Statistics</h2>
        <div className="space-y-2">
          {selectedIndices.size > 0 ? (
            <>
              <div className="font-medium">Selected Features: {selectedIndices.size}</div>
              <div className="text-gray-600">Area: {formatArea(selectedArea)}</div>
            </>
          ) : (
            <>
              <div className="font-medium">Total Features: {features.length}</div>
              <div className="text-gray-600" data-testid="total-area">
                Total Area: {formatArea(totalArea)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feature List Section */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h3 className="font-medium mb-2">Features</h3>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-2 rounded cursor-pointer transition-colors
                  ${selectedIndices.has(index) ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-gray-100'}`}
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

// Create a container component that handles the context
export function MetricsContainer() {
  const { solution, selectedFeatureIndices, setSelectedFeatureIndices } = useActiveSolution();

  return (
    <Metrics
      features={solution?.features ?? []}
      selectedIndices={selectedFeatureIndices}
      onSelectionChange={setSelectedFeatureIndices}
    />
  );
}
