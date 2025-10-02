import { useQuery } from '@tanstack/react-query';

import { decompressGzip } from '../utils/decompressGzip';
import ROUTES from '../utils/routes';

const BASE_URL =
  import.meta.env.VITE_IS_WORK == 'prod'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_WORK;

/**
 * Хук для получения и разархивирования данных полигонов из gzip
 * @param {string} from - начальная дата (YYYY-MM-DD)
 * @param {string} to - конечная дата (YYYY-MM-DD)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useGzipPolygonsData = () => {
  const buildUrl = () => {
    const params = new URLSearchParams();

    return `${BASE_URL}${ROUTES.POLYGONS}${params.toString() ? '?' + params.toString() : ''}`;
  };

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gzipPolygonsData'],
    queryFn: async () => {
      try {
        const url = buildUrl();

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/gzip',
            'Content-Type': 'application/gzip',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        const decompressedText = await decompressGzip(arrayBuffer);

        const parsedData = JSON.parse(decompressedText);

        return parsedData;
      } catch (err) {
        console.error('Ошибка в useGzipPolygonsData:', err);
        throw err;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 минут кеширования
    cacheTime: 30 * 60 * 1000, // 30 минут в кеше
  });

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
};
