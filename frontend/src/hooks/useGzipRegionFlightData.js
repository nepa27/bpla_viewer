import { useQuery } from '@tanstack/react-query';

import { decompressGzip } from '../utils/decompressGzip';
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

        // Разархивируем gzip
        const decompressedText = await decompressGzip(arrayBuffer);

        // Парсим CSV
        const rawData = parseCsv(decompressedText);

        // Обрабатываем данные
        const processedData = processData(rawData);

        return processedData;
      } catch (err) {
        console.error('Ошибка в useGzipRegionFlightData:', err);
        throw err;
      }
    },
    enabled: !!regionId && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 минут кеширования
    cacheTime: 30 * 60 * 1000, // 30 минут в кеше
  });

  const parseCoordinates = (coordString) => {
    if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
      return [];
    }
    return coordString
      .split(' ')
      .map(Number)
      .filter((n) => !isNaN(n));
  };

  const parseDate = (dateString) => {
    if (!dateString || dateString === 'Не найдена') {
      return null;
    }

    const [day, month, year] = dateString.split('.');
    if (!day || !month || !year) {
      return null;
    }

    // Преобразуем YY в YYYY
    const fullYear =
      parseInt(year, 10) <= 29 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
    const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    return isNaN(date.getTime()) ? null : date;
  };

  const processData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];

    const batchSize = 1000;
    const result = [];

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);
      const processedBatch = batch
        .map((d, index) => {
          try {
            const takeoffCoords = parseCoordinates(d['takeoff_coords']);

            if (takeoffCoords.length >= 2) {
              const lat = takeoffCoords[0];
              const lng = takeoffCoords[1];

              if (!isNaN(lat) && !isNaN(lng)) {
                const date = parseDate(d['flight_date']);

                if (date && date instanceof Date && !isNaN(date.getTime())) {
                  const durationMinutes = prepareFlightDurations(d['flight_duration']);

                  return {
                    id: d['flight_id'] || `${i}_${index}_${Math.random()}`,
                    date: date.toISOString().split('T')[0],
                    lat,
                    lng,
                    takeoff_time: d['takeoff_time'] || 'Не найдено',
                    landing_time: d['landing_time'] || 'Не найдено',
                    type: d['drone_type'] || 'Не указан',
                    region: d['region_name'] || 'Не определен',
                    durationMinutes: durationMinutes,
                  };
                }
              }
            }
            return null;
          } catch (err) {
            console.warn('Ошибка обработки строки данных:', err);
            return null;
          }
        })
        .filter((d) => d !== null);

      result.push(...processedBatch);
    }

    return result;
  };

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
};
