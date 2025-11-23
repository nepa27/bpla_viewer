import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ArrayBufferMock } from '../../__mocks__/data.mock.js';
import { decompressGzip } from '../../utils/decompressGzip.js';
import { useGzipPolygonsData } from '../useGzipPolygonsData.js';

const queryClient = new QueryClient();

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: Promise.resolve([]),
  }),
);

describe('useGzipPolygonsData', () => {
  it('should return an object with correct properties', () => {
    const { result } = renderHook(useGzipPolygonsData, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');

    expect(typeof result.current.data).toBe('object');
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.error).toBe('object');
    expect(typeof result.current.refetch).toBe('function');
  });

  it.todo('should get data', async () => {
    const { result } = renderHook(useGzipPolygonsData, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });
    await fetch('');
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
  it.todo('should decompress gzip data', () => {});
  it.todo('should throw an error', () => {});
});
