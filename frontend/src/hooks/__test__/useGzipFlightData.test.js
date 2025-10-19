import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useGzipFlightData } from '../useGzipFlightData.js';

describe('useGzipFlightData', () => {
  beforeEach(() => {
    const from = '2025-02-10';
    const to = '2025-04-25';
  });

  it.todo('should return an object with correct properties', () => {
    const { result } = renderHook((from, to) => useGzipFlightData(from, to));

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');

    expect(Array.isArray(result.current.data)).toBeTruthy();
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('object');
    expect(typeof result.current.refetch).toBe('function');
  });

  it.todo('should get gzip data', () => {});
  it.todo('should decompress gzip data', () => {});
  it.todo('should parsed csv data to json', () => {});
  it.todo('should prepare data for a specific structure ', () => {});
});
