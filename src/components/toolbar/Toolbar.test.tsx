import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  const mockProps = {
    booleanOperationsAvailable: true,
    onUnion: vi.fn(),
    onIntersection: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders all operation buttons when operations are available', () => {
    render(<Toolbar {...mockProps} />);

    expect(screen.getByTestId('toolbar-union-button')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-intersection-button')).toBeInTheDocument();
  });

  it('calls appropriate handlers when buttons are clicked', () => {
    render(<Toolbar {...mockProps} />);

    fireEvent.click(screen.getByTestId('toolbar-union-button'));
    expect(mockProps.onUnion).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('toolbar-intersection-button'));
    expect(mockProps.onIntersection).toHaveBeenCalled();
  });

  it('disables buttons when operations are not available', () => {
    render(<Toolbar {...mockProps} booleanOperationsAvailable={false} />);

    expect(screen.getByTestId('toolbar-union-button')).toBeDisabled();
    expect(screen.getByTestId('toolbar-intersection-button')).toBeDisabled();
  });
});
