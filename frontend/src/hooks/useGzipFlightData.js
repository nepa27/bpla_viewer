import { useQuery } from '@tanstack/react-query';

import { decompressGzip } from '../utils/decompressGzip';
import { processData } from '../utils/flightDataProcessors';
import { parseCsv } from '../utils/parseCsv';
import { prepareFlightDurations } from '../utils/prepareFlightDurations';
import ROUTES from '../utils/routes';

const BASE_URL =
  import.meta.env.VITE_IS_WORK == 'prod'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_WORK;

/**
 * Хук для получения и обработки данных полетов из gzip
 * @param {string} from - начальная дата (YYYY-MM-DD)
 * @param {string} to - конечная дата (YYYY-MM-DD)
 * @returns {Object} { data, loading, error, refetch }
 */

export const useGzipFlightData = (from, to) => {
  const buildUrl = () => {
    const params = new URLSearchParams();
    if (from) params.append('from_date', from);
    if (to) params.append('to_date', to);
    return `${BASE_URL}${ROUTES.REGIONS}${params.toString() ? '?' + params.toString() : ''}`;
  };

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gzipFlightData', from, to],
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
        const rawData = parseCsv(decompressedText);
        const processedData = processData(rawData, prepareFlightDurations);
        return processedData;
      } catch (err) {
        console.error('Ошибка в useGzipFlightData:', err);
        throw err;
      }
    },
    enabled: !!from && !!to,
  });

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
};
