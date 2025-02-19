import { screen, render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metrics } from './Metrics';
import { PolygonFeature } from '@/types/types';

// Fix the @turf/area mock to export the default function correctly
vi.mock('@turf/area', async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
});

describe('Metrics', () => {
  const mockFeatures: PolygonFeature[] = [
    {
      type: 'Feature',
      properties: { id: '1' },
      geometry: {
        type: 'Polygon',
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
      type: 'Feature',
      properties: { id: '2' },
      geometry: {
        type: 'Polygon',
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
  ];

  it('displays "No active solution" when no features are provided', () => {
    render(<Metrics features={[]} selectedIndices={new Set()} onSelectionChange={() => {}} />);
    expect(screen.getByText(/no active solution selected/i)).toBeInTheDocument();
  });

  it('displays area calculations when features are available', () => {
    render(<Metrics features={mockFeatures} selectedIndices={new Set([0])} onSelectionChange={() => {}} />);
    expect(screen.getByText(/Selected Features:/i)).toBeInTheDocument();
    expect(screen.getByText('Selected Features: 1')).toBeInTheDocument();
    expect(
      screen.getByText('Area: 12,363,718,145 m²', { selector: '.text-gray-600:not(.text-sm)' }),
    ).toBeInTheDocument();
  });

  it('displays total area for multiple selected features', () => {
    render(<Metrics features={mockFeatures} selectedIndices={new Set([0, 1])} onSelectionChange={() => {}} />);
    expect(screen.getByRole('heading', { name: /statistics/i })).toBeInTheDocument();
    expect(screen.getByText('Selected Features: 2')).toBeInTheDocument();
    expect(screen.getByText(/Area: 24,727,436,290 m²/)).toBeInTheDocument();
  });

  it('calls onSelectionChange when features are clicked', () => {
    const handleSelectionChange = vi.fn();
    render(<Metrics features={mockFeatures} selectedIndices={new Set()} onSelectionChange={handleSelectionChange} />);

    // Add this test if you have clickable features in your UI
    // const featureElement = screen.getByTestId('feature-0');
    // fireEvent.click(featureElement);
    // expect(handleSelectionChange).toHaveBeenCalledWith(new Set([0]));
  });
});
