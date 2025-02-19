import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// This extends Vitest's expect with Testing Library's matchers
expect.extend(await import('@testing-library/jest-dom/matchers'));

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
