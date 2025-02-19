import { expect } from 'vitest';
import { runUnion, runIntersection } from './geometryOps';

describe('Geometry Operations', () => {
  it('returns null for invalid inputs', () => {
    expect(runUnion([])).toBeNull();
    expect(runIntersection([])).toBeNull();
  });
});
