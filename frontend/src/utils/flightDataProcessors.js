/**
 * Парсит строку координат вида "55.751244 37.618423" в массив [lat, lng]
 * @param {string} coordString - строка с координатами
 * @returns {number[]} - [lat, lng] или пустой массив
 */
export const parseCoordinates = (coordString) => {
  if (!coordString || coordString === 'Не найдены' || coordString === 'Не указан') {
    return [];
  }
  return coordString
    .split(' ')
    .map(Number)
    .filter((n) => !isNaN(n));
};

/**
 * Парсит дату из формата DD.MM.YY или DD.MM.YYYY в объект Date
 * @param {string} dateString - дата в формате "DD.MM.YY" или "DD.MM.YYYY"
 * @returns {Date | null}
 */
export const parseDate = (dateString) => {
  if (!dateString || dateString === 'Не найдена') {
    return null;
  }

  const [day, month, year] = dateString.split('.');
  if (!day || !month || !year) {
    return null;
  }

  // Преобразуем YY в YYYY (00-29 → 20XX, 30-99 → 19XX)
  const fullYear =
    parseInt(year, 10) <= 29 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
  const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Обрабатывает сырые данные полётов (массив объектов из CSV)
 * @param {Array<Object>} rawData - сырые данные из CSV
 * @param {Function} prepareFlightDurations - функция для парсинга длительности полёта
 * @returns {Array<Object>} - обработанные данные
 */
export const processData = (rawData, prepareFlightDurations) => {
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

                // Генерируем стабильный fallback ID без Math.random()
                const fallbackId = d['flight_id']
                  ? d['flight_id']
                  : `${i}_${index}_${d['flight_date'] || ''}_${d['takeoff_coords'] || ''}`;

                return {
                  id: fallbackId,
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
          console.warn('Ошибка обработки строки данных:', err, d);
          return null;
        }
      })
      .filter((d) => d !== null);

    result.push(...processedBatch);
  }

  return result;
};
