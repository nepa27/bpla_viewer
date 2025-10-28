import { useQuery } from '@tanstack/react-query';

import { decompressGzip } from '../utils/decompressGzip';
import { processData } from '../utils/flightDataProcessors';
import { parseCsv } from '../utils/parseCsv';
import { prepareFlightDurations } from '../utils/prepareFlightDurations';

const BASE_URL =
  import.meta.env.VITE_IS_WORK == 'prod'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_WORK;

/**
 * Хук для получения и обработки данных полетов для конкретного региона из gzip
 * Использует эндпоинт: GET /regions/:id?from_date=...&to_date=...
 * @param {string} regionId - ID региона
 * @param {string} from - начальная дата (YYYY-MM-DD)
 * @param {string} to - конечная дата (YYYY-MM-DD)
 * @returns {Object} { data, loading, error, refetch }
 */

export const useGzipRegionFlightData = (regionId, from, to) => {
  const buildUrl = () => {
    if (!regionId) return null;
    const params = new URLSearchParams();
    if (from) params.append('from_date', from);
    if (to) params.append('to_date', to);
    return `${BASE_URL}/regions/${regionId}${params.toString() ? '?' + params.toString() : ''}`;
  };

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gzipRegionFlightData', regionId, from, to],
    queryFn: async () => {
      try {
        if (!regionId || !from || !to) {
          return [];
        }

        const url = buildUrl();
        if (!url) {
          throw new Error('Не указан ID региона');
        }

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
        const rawData = parseCsv(decompressedText);
        const processedData = processData(rawData, prepareFlightDurations);

        return processedData;
      } catch (err) {
        console.error('Ошибка в useGzipRegionFlightData:', err);
        throw err;
      }
    },
    enabled: !!regionId && !!from && !!to,
  });

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
};
