// hooks/useGzipPolygonsData.js
import { useQuery } from '@tanstack/react-query';

import { decompressGzip } from '../utils/decompressGzip';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_WORK;
//'http://192.168.0.133:8000'; // @TODO import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_WORK;
const POLYGONS_ENDPOINT = '/polygons';

/**
 * Хук для получения и разархивирования данных полигонов из gzip
 * @param {string} from - начальная дата (YYYY-MM-DD)
 * @param {string} to - конечная дата (YYYY-MM-DD)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useGzipPolygonsData = () => {
  const buildUrl = () => {
    const params = new URLSearchParams();
    // if (from) params.append('from_date', from);
    // if (to) params.append('to_date', to);

    return `${BASE_URL}${POLYGONS_ENDPOINT}${params.toString() ? '?' + params.toString() : ''}`;
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
        console.log('Загрузка данных полигонов с:', url);

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
        console.log('Получен gzip архив размером:', arrayBuffer.byteLength, 'байт');

        // Разархивируем gzip
        const decompressedText = await decompressGzip(arrayBuffer);
        console.log('Данные разархивированы, размер текста:', decompressedText.length, 'символов');

        // Парсим JSON
        const parsedData = JSON.parse(decompressedText);
        console.log('JSON распарсен, объектов:', parsedData?.features?.length || 0);

        return parsedData;
      } catch (err) {
        console.error('Ошибка в useGzipPolygonsData:', err);
        throw err;
      }
    },
    enabled: true, // Всегда включен, но можно добавить условия
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
