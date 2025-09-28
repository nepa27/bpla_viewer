// hooks/useData.js
import pako from 'pako';

import { useCallback, useEffect, useMemo, useState } from 'react';

const gzipUrl = 'http://localhost:5000/csv';

// Функция для разархивирования gzip в браузере
async function decompressGzip(arrayBuffer) {
  // Проверяем поддержку CompressionStream API
  if ('CompressionStream' in window) {
    try {
      const stream = new Response(arrayBuffer).body.pipeThrough(new DecompressionStream('gzip'));
      return await new Response(stream).text();
    } catch (err) {
      // fallback to pako
    }
  }

  // Используем pako как fallback
  try {
    const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
    return decompressed;
  } catch (err) {
    throw new Error('Failed to decompress gzip data');
  }
}

// Функция для парсинга CSV строки с оптимизацией
function parseCsv(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const data = [];

  // Используем for loop для лучшей производительности
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ? values[j].trim() : '';
    }

    data.push(row);
  }

  return data;
}

function prepareFlightDurations(duration) {
  // flight_duration: "1:00"
  if (!duration || duration === 'Не найдено') {
    return 0; // Если время не найдено, считаем длительность 0
  }

  try {
    const [durationHours, durationMinutes] = duration.split(':').map(Number);

    if (isNaN(durationHours) || isNaN(durationMinutes)) {
      return 0;
    }

    const durationTotalMinutes = durationHours * 60 + durationMinutes;

    return Math.max(0, durationTotalMinutes);
  } catch (err) {
    console.warn('Error calculating flight duration ', err);
    return 0;
  }
}
// {
//     "flight_id": "7772529562",
//     "drone_type": "BLA",
//     "takeoff_coords": "53.38 88.12",
//     "landing_coords": "53.38 88.12",
//     "flight_date": "14.05.25",
//     "takeoff_time": "03:00",
//     "landing_time": "09:00",
//     "flight_duration": "6:00",
//     "region_name": "Кемеровская область"
// }

export const useData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Мемоизированные функции для обработки данных
  const parseCoordinates = useCallback((coordString) => {
    if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
      return [];
    }
    return coordString
      .split(' ')
      .map(Number)
      .filter((n) => !isNaN(n));
  }, []);

  const parseDate = useCallback((dateString) => {
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
  }, []);

  // Оптимизированная функция обработки данных с batch processing
  const processData = useCallback(
    (rawData) => {
      if (!rawData || rawData.length === 0) return [];

      const batchSize = 1000; // Обрабатываем данные порциями
      const result = [];

      for (let i = 0; i < rawData.length; i += batchSize) {
        const batch = rawData.slice(i, i + batchSize);
        const processedBatch = batch
          .map((d) => {
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
                      id: d['flight_id'] || `${i}_${Math.random()}`,
                      date: date.toISOString().split('T')[0],
                      lat,
                      lng,
                      takeoff_time: d['takeoff_time'] || 'Не найдено',
                      landing_time: d['landing_time'] || 'Не найдено',
                      type: d['drone_type'] || 'Не указан',
                      // region: d['region_id'] || 'Не определен',
                      region: d['region_name'] || 'Не определен', // @TODO
                      durationMinutes: durationMinutes, // d['flight_duration'],
                    };
                  }
                }
              }
              return null;
            } catch (err) {
              return null;
            }
          })
          .filter((d) => d !== null);

        result.push(...processedBatch);
      }

      return result;
    },
    [parseCoordinates, parseDate],
  );

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загружаем gzip файл с таймаутом
        const response = await fetch(gzipUrl, {
          signal: abortController.signal,
          timeout: 30000, // 30 секунд таймаут
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Разархивируем gzip
        const decompressedText = await decompressGzip(arrayBuffer);

        // Парсим CSV
        const rawData = parseCsv(decompressedText);

        // Обрабатываем данные только если компонент еще mounted
        if (isMounted && !abortController.signal.aborted) {
          const processedData = processData(rawData);
          setData(processedData);
        }
      } catch (err) {
        if (isMounted && !abortController.signal.aborted) {
          console.error('Ошибка загрузки данных:', err);
          setError(err.message);
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [processData]);

  return { data, loading, error };
};
// // hooks/useData.js
// import pako from 'pako';

// import { useCallback, useEffect, useMemo, useState } from 'react';

// const gzipUrl = 'http://localhost:5000/csv';

// // Функция для разархивирования gzip в браузере
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

//   // Используем pako как fallback
//   try {
//     const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
//     return decompressed;
//   } catch (err) {
//     throw new Error('Failed to decompress gzip data');
//   }
// }

// // Функция для парсинга CSV строки с оптимизацией
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

// // --- НОВОЕ: Функция для вычисления длительности полета в минутах ---
// function calculateFlightDurationMinutes(takeoffTimeStr, landingTimeStr) {
//   if (
//     !takeoffTimeStr ||
//     !landingTimeStr ||
//     takeoffTimeStr === 'Не найдено' ||
//     landingTimeStr === 'Не найдено'
//   ) {
//     return 0; // Если время не найдено, считаем длительность 0
//   }

//   try {
//     const [takeoffHours, takeoffMinutes] = takeoffTimeStr.split(':').map(Number);
//     const [landingHours, landingMinutes] = landingTimeStr.split(':').map(Number);

//     if (
//       isNaN(takeoffHours) ||
//       isNaN(takeoffMinutes) ||
//       isNaN(landingHours) ||
//       isNaN(landingMinutes)
//     ) {
//       return 0;
//     }

//     const takeoffTotalMinutes = takeoffHours * 60 + takeoffMinutes;
//     let landingTotalMinutes = landingHours * 60 + landingMinutes;

//     // Обработка перелета через полночь
//     // Предполагаем, что если время посадки меньше времени взлета,
//     // значит посадка была на следующий день
//     if (landingTotalMinutes < takeoffTotalMinutes) {
//       landingTotalMinutes += 24 * 60; // Добавляем 24 часа в минутах
//     }

//     const durationMinutes = landingTotalMinutes - takeoffTotalMinutes;
//     return Math.max(0, durationMinutes); // Длительность не может быть отрицательной
//   } catch (err) {
//     console.warn('Error calculating flight duration:', err, { takeoffTimeStr, landingTimeStr });
//     return 0;
//   }
// }
// // --- КОНЕЦ НОВОГО ---

// export const useData = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Мемоизированные функции для обработки данных
//   const parseCoordinates = useCallback((coordString) => {
//     if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
//       return [];
//     }
//     return coordString
//       .split(' ')
//       .map(Number)
//       .filter((n) => !isNaN(n));
//   }, []);

//   const parseDate = useCallback((dateString) => {
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
//   }, []);

//   // Оптимизированная функция обработки данных с batch processing
//   const processData = useCallback(
//     (rawData) => {
//       if (!rawData || rawData.length === 0) return [];

//       const batchSize = 1000; // Обрабатываем данные порциями
//       const result = [];

//       for (let i = 0; i < rawData.length; i += batchSize) {
//         const batch = rawData.slice(i, i + batchSize);
//         const processedBatch = batch
//           .map((d) => {
//             try {
//               const takeoffCoords = parseCoordinates(d['Координаты взлета']);

//               if (takeoffCoords.length >= 2) {
//                 const lat = takeoffCoords[0];
//                 const lng = takeoffCoords[1];

//                 if (!isNaN(lat) && !isNaN(lng)) {
//                   const date = parseDate(d['Дата (DD.MM.YY)']);

//                   if (date && date instanceof Date && !isNaN(date.getTime())) {
//                     // --- НОВОЕ: Вычисляем длительность полета ---
//                     const durationMinutes = calculateFlightDurationMinutes(
//                       d['Время взлета (UTC)'],
//                       d['Время посадки (UTC)'],
//                     );
//                     // --- КОНЕЦ НОВОГО ---

//                     return {
//                       id: d['ID полета'] || `${i}_${Math.random()}`,
//                       date: date.toISOString().split('T')[0],
//                       lat,
//                       lng,
//                       type: d['Тип БПЛА'] || 'Не указан',
//                       region: d['Регион'] || 'Не определен',
//                       // --- НОВОЕ: Добавляем длительность ---
//                       durationMinutes: durationMinutes,
//                       // --- КОНЕЦ НОВОГО ---
//                     };
//                   }
//                 }
//               }
//               return null;
//             } catch (err) {
//               return null;
//             }
//           })
//           .filter((d) => d !== null);

//         result.push(...processedBatch);
//       }

//       return result;
//     },
//     [parseCoordinates, parseDate],
//   );

//   useEffect(() => {
//     let isMounted = true;
//     let abortController = new AbortController();

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Загружаем gzip файл с таймаутом
//         const response = await fetch(gzipUrl, {
//           signal: abortController.signal,
//           timeout: 30000, // 30 секунд таймаут
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const arrayBuffer = await response.arrayBuffer();

//         // Разархивируем gzip
//         const decompressedText = await decompressGzip(arrayBuffer);

//         // Парсим CSV
//         const rawData = parseCsv(decompressedText);
//         console.log(rawData);
//         // Обрабатываем данные только если компонент еще mounted
//         if (isMounted && !abortController.signal.aborted) {
//           const processedData = processData(rawData);
//           setData(processedData);
//         }
//       } catch (err) {
//         if (isMounted && !abortController.signal.aborted) {
//           console.error('Ошибка загрузки данных:', err);
//           setError(err.message);
//           setData([]);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       isMounted = false;
//       abortController.abort();
//     };
//   }, [processData]);

//   return { data, loading, error };
// };

// Серверный код для отдачи gzip файла
// app.get("/csv", (req, res) => {
//   // const filePath = path.join(__dirname, "public", "all_flights.tar.gz");
//   const filePath = path.join(__dirname, "public", "parsed_flight_data_2025.tar.gz");

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: "Файл не найден" });
//   }

//   const mimeType = "application/gzip";

//   res.setHeader("Content-Type", mimeType);
//   res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);

//   const fileStream = fs.createReadStream(filePath);
//   fileStream.pipe(res);

//   fileStream.on("error", (err) => {
//     console.error("Ошибка чтения файла:", err);
//     res.status(500).json({ error: "Ошибка при открытии файла" });
//   });
// });

// Проверенный рабочий вариант
// // hooks/useData.js
// import pako from 'pako';
// import { useEffect, useState, useCallback, useMemo } from 'react';

// const gzipUrl = 'http://localhost:5000/csv';

// // Функция для разархивирования gzip в браузере
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

//   // Используем pako как fallback
//   try {
//     const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
//     return decompressed;
//   } catch (err) {
//     throw new Error('Failed to decompress gzip data');
//   }
// }

// // Функция для парсинга CSV строки с оптимизацией
// function parseCsv(csvString) {
//   const lines = csvString.trim().split('\n');
//   if (lines.length === 0) return [];

//   const headers = lines[0].split(',').map(h => h.trim());
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

// export const useData = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Мемоизированные функции для обработки данных
//   const parseCoordinates = useCallback((coordString) => {
//     if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
//       return [];
//     }
//     return coordString
//       .split(' ')
//       .map(Number)
//       .filter(n => !isNaN(n));
//   }, []);

//   const parseDate = useCallback((dateString) => {
//     if (!dateString || dateString === 'Не найдена') {
//       return null;
//     }

//     const [day, month, year] = dateString.split('.');
//     if (!day || !month || !year) {
//       return null;
//     }

//     // Преобразуем YY в YYYY
//     const fullYear = parseInt(year, 10) <= 29 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
//     const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
//     return isNaN(date.getTime()) ? null : date;
//   }, []);

//   // Оптимизированная функция обработки данных с batch processing
//   const processData = useCallback((rawData) => {
//     if (!rawData || rawData.length === 0) return [];

//     const batchSize = 1000; // Обрабатываем данные порциями
//     const result = [];

//     for (let i = 0; i < rawData.length; i += batchSize) {
//       const batch = rawData.slice(i, i + batchSize);
//       const processedBatch = batch
//         .map(d => {
//           try {
//             const takeoffCoords = parseCoordinates(d['Координаты взлета']);

//             if (takeoffCoords.length >= 2) {
//               const lat = takeoffCoords[0];
//               const lng = takeoffCoords[1];

//               if (!isNaN(lat) && !isNaN(lng)) {
//                 const date = parseDate(d['Дата (DD.MM.YY)']);

//                 if (date && date instanceof Date && !isNaN(date.getTime())) {
//                   return {
//                     id: d['ID полета'] || `${i}_${Math.random()}`,
//                     date: date.toISOString().split('T')[0],
//                     lat,
//                     lng,
//                     type: d['Тип БПЛА'] || 'Не указан',
//                     region: d['Регион'] || 'Не определен'
//                   };
//                 }
//               }
//             }
//             return null;
//           } catch (err) {
//             return null;
//           }
//         })
//         .filter(d => d !== null);

//       result.push(...processedBatch);
//     }

//     return result;
//   }, [parseCoordinates, parseDate]);

//   useEffect(() => {
//     let isMounted = true;
//     let abortController = new AbortController();

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Загружаем gzip файл с таймаутом
//         const response = await fetch(gzipUrl, {
//           signal: abortController.signal,
//           timeout: 30000 // 30 секунд таймаут
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const arrayBuffer = await response.arrayBuffer();

//         // Разархивируем gzip
//         const decompressedText = await decompressGzip(arrayBuffer);

//         // Парсим CSV
//         const rawData = parseCsv(decompressedText);

//         // Обрабатываем данные только если компонент еще mounted
//         if (isMounted && !abortController.signal.aborted) {
//           const processedData = processData(rawData);
//           setData(processedData);
//         }
//       } catch (err) {
//         if (isMounted && !abortController.signal.aborted) {
//           console.error('Ошибка загрузки данных:', err);
//           setError(err.message);
//           setData([]);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       isMounted = false;
//       abortController.abort();
//     };
//   }, [processData]);

//   return { data, loading, error };
// };

// import pako from 'pako';

// import { useEffect, useMemo, useState } from 'react';

// const gzipUrl = 'http://localhost:5000/csv';

// // Функция для разархивирования gzip в браузере
// function decompressGzip(arrayBuffer) {
//   // Проверяем поддержку CompressionStream API
//   if ('CompressionStream' in window) {
//     // Используем современный API если доступен
//     const stream = new Response(arrayBuffer).body.pipeThrough(new DecompressionStream('gzip'));
//     return new Response(stream).text();
//   } else {
//     // Используем pako для старых браузеров
//     try {
//       const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
//       return Promise.resolve(decompressed);
//     } catch (err) {
//       throw new Error('Failed to decompress gzip data with pako');
//     }
//   }
// }

// // Функция для парсинга CSV строки
// function parseCsv(csvString) {
//   const lines = csvString.trim().split('\n');
//   const headers = lines[0].split(',').map((h) => h.trim());
//   const data = [];

//   for (let i = 1; i < lines.length; i++) {
//     const values = lines[i].split(',');
//     const row = {};

//     headers.forEach((header, index) => {
//       row[header] = values[index] ? values[index].trim() : '';
//     });

//     data.push(row);
//   }

//   return data;
// }

// export const useData = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Функция для парсинга координат
//   const parseCoordinates = useMemo(
//     () => (coordString) => {
//       if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
//         return [];
//       }
//       return coordString
//         .split(' ')
//         .map(Number)
//         .filter((n) => !isNaN(n));
//     },
//     [],
//   );

//   // Функция для преобразования даты из формата DD.MM.YY
//   const parseDate = useMemo(
//     () => (dateString) => {
//       if (!dateString || dateString === 'Не найдена') {
//         return null;
//       }

//       const [day, month, year] = dateString.split('.');
//       if (!day || !month || !year) {
//         return null;
//       }

//       // Преобразуем YY в YYYY (предполагаем 20xx для 00-29, 19xx для 30-99)
//       const fullYear =
//         parseInt(year, 10) <= 29 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
//       const fullMonth = month.padStart(2, '0');
//       const fullDay = day.padStart(2, '0');

//       const date = new Date(`${fullYear}-${fullMonth}-${fullDay}`);
//       return isNaN(date.getTime()) ? null : date;
//     },
//     [],
//   );

//   // Функция для обработки каждой строки данных
//   const processRow = useMemo(
//     () => (d) => {
//       try {
//         // Парсим координаты взлета
//         const takeoffCoords = parseCoordinates(d['Координаты взлета']);

//         // Используем координаты взлета как основные координаты для отображения на карте
//         if (takeoffCoords.length >= 2) {
//           d.lat = takeoffCoords[0];
//           d.lng = takeoffCoords[1];
//         }

//         // Парсим координаты посадки
//         d.coordsLand = parseCoordinates(d['Координаты посадки']);
//         d.coordsTakeOff = takeoffCoords;

//         // Парсим дату
//         d.date = parseDate(d['Дата (DD.MM.YY)']);

//         // Извлекаем тип
//         d.type = d['Тип БПЛА'] || 'Не указан';

//         // Извлекаем ID
//         d.id = d['ID полета'] || Math.random().toString(36).substr(2, 9);

//         // Извлекаем регион
//         d.region = d['Регион'] || 'Не определен';

//         return d;
//       } catch (err) {
//         console.warn('Ошибка обработки строки:', err, d);
//         return null;
//       }
//     },
//     [parseCoordinates, parseDate],
//   );

//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Загружаем gzip файл
//         const response = await fetch(gzipUrl);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const arrayBuffer = await response.arrayBuffer();

//         // Разархивируем gzip
//         let decompressedText;
//         try {
//           decompressedText = await decompressGzip(arrayBuffer);
//         } catch (decompressError) {
//           // Если браузер не поддерживает DecompressionStream, используем fallback
//           throw new Error(
//             'Browser does not support gzip decompression. Please use a modern browser or install pako.js library.',
//           );
//         }

//         // Парсим CSV
//         const rawData = parseCsv(decompressedText);

//         // Обрабатываем данные
//         const processedData = rawData
//           .map(processRow)
//           .filter(
//             (d) =>
//               d &&
//               d.lat != null &&
//               d.lng != null &&
//               !isNaN(d.lat) &&
//               !isNaN(d.lng) &&
//               d.date instanceof Date &&
//               !isNaN(d.date.getTime()),
//           )
//           // Преобразуем в формат, совместимый с mockFlightsData
//           .map((d) => ({
//             id: d.id,
//             date: d.date.toISOString().split('T')[0], // Формат YYYY-MM-DD
//             lat: d.lat,
//             lng: d.lng,
//             type: d.type,
//             region: d.region,
//           }));

//         if (isMounted) {
//           setData(processedData);
//         }
//       } catch (err) {
//         console.error('Ошибка загрузки данных:', err);
//         if (isMounted) {
//           setError(err.message);
//           setData([]); // Устанавливаем пустой массив вместо null
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       isMounted = false;
//     };
//   }, [processRow]);

//   return data; // { data, loading, error };
// };

// // import { useState, useEffect } from 'react';
// // import { csv } from 'd3';
// // const csvUrl =
// //   'https://gist.githubusercontent.com/curran/a9656d711a8ad31d812b8f9963ac441c/raw/c22144062566de911ba32509613c84af2a99e8e2/MissingMigrants-Global-2019-10-08T09-47-14-subset.csv';
// // const row = d => {
// //   d.coords = d['Location Coordinates'].split(',').map(d => +d).reverse();
// //   d['Total Dead and Missing'] = + d['Total Dead and Missing'];
// //   d['Reported Date'] = new Date(d['Reported Date']);
// //   return d;
// // };
// // export const useData = () => {
// //   const [data, setData] = useState(null);
// //   useEffect(() => {
// //     csv(csvUrl, row).then(setData);
// //   }, []);
// //   return data;
// // };

// const mockFlightsData = [
//   { id: 1, date: '2024-01-15', lat: 55.7558, lng: 37.6173, type: 'Boeing' },
//   { id: 2, date: '2024-01-16', lat: 59.9343, lng: 30.3351, type: 'Airbus' },
//   { id: 3, date: '2024-01-17', lat: 56.3269, lng: 44.0055, type: 'Boeing' },
//   { id: 4, date: '2024-01-18', lat: 55.1542, lng: 61.4291, type: 'Airbus' },
//   { id: 5, date: '2024-01-19', lat: 54.7065, lng: 20.5109, type: 'Boeing' },
//   { id: 6, date: '2024-01-20', lat: 53.2415, lng: 50.2212, type: 'Airbus' },
//   { id: 7, date: '2024-01-21', lat: 56.8575, lng: 60.6129, type: 'Boeing' },
//   { id: 8, date: '2024-01-22', lat: 56.0184, lng: 92.8672, type: 'Airbus' },
//   { id: 9, date: '2024-01-23', lat: 54.9885, lng: 82.8939, type: 'Boeing' },
//   { id: 73, date: '2024-01-21', lat: 56.8575, lng: 60.6129, type: 'Boeing' },
//   { id: 82, date: '2024-01-22', lat: 56.0184, lng: 92.8672, type: 'Airbus' },
//   { id: 91, date: '2024-01-23', lat: 54.9885, lng: 82.8939, type: 'Boeing' },
//   { id: 100, date: '2024-01-24', lat: 52.2871, lng: 104.2838, type: 'Airbus' },
//   { id: 11, date: '2024-02-01', lat: 65.7558, lng: 37.6173, type: 'Boeing' },
//   { id: 12, date: '2024-02-05', lat: 59.9343, lng: 30.3351, type: 'Airbus' },
//   { id: 13, date: '2024-02-10', lat: 56.3269, lng: 44.0055, type: 'Boeing' },
//   { id: 14, date: '2024-02-15', lat: 55.1542, lng: 61.4291, type: 'Airbus' },
//   { id: 15, date: '2024-02-20', lat: 54.7065, lng: 20.5109, type: 'Boeing' },
//   { id: 16, date: '2024-02-25', lat: 53.2415, lng: 50.2212, type: 'Airbus' },
//   { id: 17, date: '2024-03-01', lat: 56.8575, lng: 60.6129, type: 'Boeing' },
//   { id: 18, date: '2024-03-05', lat: 56.0184, lng: 92.8672, type: 'Airbus' },
//   { id: 19, date: '2024-03-10', lat: 54.9885, lng: 82.8939, type: 'Boeing' },
//   { id: 20, date: '2024-03-15', lat: 52.2871, lng: 104.2838, type: 'Airbus' },
//   { id: 21, date: '2024-03-15', lat: 52.2871, lng: 104.2838, type: 'Airbus' },
//   { id: 22, date: '2024-03-15', lat: 52.2871, lng: 104.2838, type: 'Airbus' },
//   { id: 23, date: '2024-03-15', lat: 52.2871, lng: 104.2838, type: 'Airbus' },
//   { id: 23, date: '2025-09-18', lat: 55.7558, lng: 37.6173, type: 'Airbus' },
// ];

// export const useData = () => {
//   // const [data, setData] = useState(null);

//   // useEffect(() => {
//   //   json(mockFlightsData).then(setData);
//   // }, []);

//   return mockFlightsData;
// };
