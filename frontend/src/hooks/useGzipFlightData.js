// hooks/useGzipFlightData.js
import { useQuery } from '@tanstack/react-query';

import { decompressGzip } from '../utils/decompressGzip';
import { parseCsv } from '../utils/parseCsv';
import { prepareFlightDurations } from '../utils/prepareFlightDurations';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_WORK; //'http://192.168.0.133:8000';
const FLIGHTS_DATA_ENDPOINT = '/regions'; // Предполагаемый эндпоинт для данных полетов

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

    return `${BASE_URL}${FLIGHTS_DATA_ENDPOINT}${params.toString() ? '?' + params.toString() : ''}`;
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
        console.log('Загрузка данных полетов с:', url);

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

        // Парсим CSV
        const rawData = parseCsv(decompressedText);
        console.log('CSV распарсен, строк:', rawData.length);

        // Обрабатываем данные
        const processedData = processData(rawData);
        console.log('Данные обработаны, записей:', processedData.length);

        return processedData;
      } catch (err) {
        console.error('Ошибка в useGzipFlightData:', err);
        throw err;
      }
    },
    enabled: !!from && !!to, // Выполняется только если указаны даты
    staleTime: 5 * 60 * 1000, // 5 минут кеширования
    cacheTime: 30 * 60 * 1000, // 30 минут в кеше
  });

  // Функции обработки данных
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

// Альтернатива
// // hooks/useGzipFlightData.js
// import { useQuery } from '@tanstack/react-query';
// import pako from 'pako';

// const BASE_URL = 'http://192.168.0.133:8000';
// const REGIONS_ENDPOINT = '/regions';

// // Функция для разархивирования gzip в браузере (идентична вашей)
// async function decompressGzip(arrayBuffer) {
//   // Проверяем поддержку CompressionStream API
//   if ('CompressionStream' in window) {
//     try {
//       const stream = new Response(arrayBuffer).body.pipeThrough(new DecompressionStream('gzip'));
//       return await new Response(stream).text();
//     } catch (err) {
//       // fallback to pako
//     }
//   }
//   // Используем pako как fallback (идентично вашей реализации)
//   try {
//     const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
//     return decompressed;
//   } catch (err) {
//     throw new Error('Failed to decompress gzip data');
//   }
// }

// // Функция для парсинга CSV строки с оптимизацией (идентична вашей)
// function parseCsv(csvString) {
//   const lines = csvString.trim().split('\n');
//   if (lines.length === 0) return [];
//   const headers = lines[0].split(',').map((h) => h.trim());
//   const data = [];
//   // Используем for loop для лучшей производительности
//   for (let i = 1; i < lines.length; i++) {
//     const values = lines[i].split(',');
//     const row = {};
//     for (let j = 0; j < headers.length; j++) {
//       row[headers[j]] = values[j] ? values[j].trim() : '';
//     }
//     data.push(row);
//   }
//   return data;
// }

// // Функция для подготовки длительности полетов (идентична вашей)
// function prepareFlightDurations(duration) {
//   // flight_duration: "1:00"
//   if (!duration || duration === 'Не найдено') {
//     return 0; // Если время не найдено, считаем длительность 0
//   }
//   try {
//     const [durationHours, durationMinutes] = duration.split(':').map(Number);
//     if (isNaN(durationHours) || isNaN(durationMinutes)) {
//       return 0;
//     }
//     const durationTotalMinutes = durationHours * 60 + durationMinutes;
//     return Math.max(0, durationTotalMinutes);
//   } catch (err) {
//     console.warn('Error calculating flight duration ', err);
//     return 0;
//   }
// }

// /**
//  * Хук для получения и обработки данных полетов из gzip
//  * @param {string} from - начальная дата (YYYY-MM-DD)
//  * @param {string} to - конечная дата (YYYY-MM-DD)
//  * @returns {Object} { data, loading, error }
//  */
// export const useGzipFlightData = (from, to) => {
//   const buildUrl = () => {
//     const params = new URLSearchParams();
//     if (from) params.append('from_date', from);
//     if (to) params.append('to_date', to);

//     return `${BASE_URL}${REGIONS_ENDPOINT}${params.toString() ? '?' + params.toString() : ''}`;
//   };

//   const {
//     data,
//     isLoading: loading,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ['gzipFlightData', from, to],
//     queryFn: async () => {
//       try {
//         const url = buildUrl();
//         console.log('Загрузка данных с:', url);

//         const response = await fetch(url, {
//           headers: {
//             'Accept': 'application/gzip',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const arrayBuffer = await response.arrayBuffer();
//         console.log('Получен gzip архив размером:', arrayBuffer.byteLength, 'байт');

//         // Разархивируем gzip (используем вашу функцию)
//         const decompressedText = await decompressGzip(arrayBuffer);
//         console.log('Данные разархивированы, размер текста:', decompressedText.length, 'символов');

//         // Парсим CSV (используем вашу функцию)
//         const rawData = parseCsv(decompressedText);
//         console.log('CSV распарсен, строк:', rawData.length);

//         // Обрабатываем данные (используем вашу логику)
//         const processedData = processData(rawData);
//         console.log('Данные обработаны, записей:', processedData.length);

//         return processedData;
//       } catch (err) {
//         console.error('Ошибка в useGzipFlightData:', err);
//         throw err;
//       }
//     },
//     enabled: !!from && !!to, // Выполняется только если указаны даты
//     staleTime: 5 * 60 * 1000, // 5 минут кеширования
//     cacheTime: 30 * 60 * 1000, // 30 минут в кеше
//   });

//   // Мемоизированные функции для обработки данных (идентичны вашим)
//   const parseCoordinates = (coordString) => {
//     if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
//       return [];
//     }
//     return coordString
//       .split(' ')
//       .map(Number)
//       .filter((n) => !isNaN(n));
//   };

//   const parseDate = (dateString) => {
//     if (!dateString || dateString === 'Не найдена') {
//       return null;
//     }
//     const [day, month, year] = dateString.split('.');
//     if (!day || !month || !year) {
//       return null;
//     }
//     // Преобразуем YY в YYYY
//     const fullYear =
//       parseInt(year, 10) <= 29 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
//     const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
//     return isNaN(date.getTime()) ? null : date;
//   };

//   // Оптимизированная функция обработки данных с batch processing (идентична вашей)
//   const processData = (rawData) => {
//     if (!rawData || rawData.length === 0) return [];

//     const batchSize = 1000; // Обрабатываем данные порциями
//     const result = [];

//     for (let i = 0; i < rawData.length; i += batchSize) {
//       const batch = rawData.slice(i, i + batchSize);
//       const processedBatch = batch
//         .map((d) => {
//           try {
//             const takeoffCoords = parseCoordinates(d['takeoff_coords']);
//             if (takeoffCoords.length >= 2) {
//               const lat = takeoffCoords[0];
//               const lng = takeoffCoords[1];
//               if (!isNaN(lat) && !isNaN(lng)) {
//                 const date = parseDate(d['flight_date']);
//                 if (date && date instanceof Date && !isNaN(date.getTime())) {
//                   const durationMinutes = prepareFlightDurations(d['flight_duration']);
//                   return {
//                     id: d['flight_id'] || `${i}_${Math.random()}`,
//                     date: date.toISOString().split('T')[0],
//                     lat,
//                     lng,
//                     takeoff_time: d['takeoff_time'] || 'Не найдено',
//                     landing_time: d['landing_time'] || 'Не найдено',
//                     type: d['drone_type'] || 'Не указан',
//                     region: d['region_name'] || 'Не определен',
//                     durationMinutes: durationMinutes,
//                   };
//                 }
//               }
//             }
//             return null;
//           } catch (err) {
//             return null;
//           }
//         })
//         .filter((d) => d !== null);
//       result.push(...processedBatch);
//     }
//     return result;
//   };

//   return {
//     data,
//     loading,
//     error: error?.message || null,
//     refetch,
//   };
// };
