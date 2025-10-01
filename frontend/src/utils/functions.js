/**
 * Преобразует строку даты в формат YYYY-MM-DD
 * @param {string} dateStr - Строка даты в формате ISO или любой другой поддерживаемой даты
 * @returns {string} Дата в формате YYYY-MM-DD (например, "2023-12-25")
 */
export function timeToDateConverter(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы с 0 до 11
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

/**
 * Получает текущую дату в формате DD.MM.YYYY
 * @returns {string} Текущая дата в формате DD.MM.YYYY (например, "25.12.2023")
 */
export function getDateNow() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы с 0 до 11
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Получает дату начала текущего года в формате DD.MM.YYYY
 * @returns {string} Дата начала года в формате DD.MM.YYYY (например, "01.01.2023")
 */
export function getDateStartYear() {
  const date = new Date();
  const year = date.getFullYear();

  return `01.01.${year}`;
}

/**
 * Подготавливает данные для линейчатых, столбчатых, линейных и других XY-диаграмм
 * (bar, column, line, area, radar и т.д.)
 *
 * @param {Array} data - Массив объектов, например: [{ region: 'A', count: 10 }, ...]
 * @param {string} labelKey - Ключ для меток (оси X)
 * @param {string} valueKey - Ключ для значений (оси Y)
 * @param {string} seriesName - Название серии (опционально, по умолчанию 'Series')
 * @param {number} [limit] - Максимальное количество элементов (опционально)
 * @param {boolean} [sortDesc=false] - Сортировать по убыванию значения (по умолчанию false)
 * @returns {Array} - Формат: [{ name, labels: [...], values: [...] }]
 */
export const prepareXYChartData = (
  data,
  labelKey,
  valueKey,
  seriesName = 'Series',
  limit = 10,
  sortDesc = false,
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [{ name: seriesName, labels: [], values: [] }];
  }

  let processedData = [...data];

  if (sortDesc) {
    processedData = processedData.sort((a, b) => {
      const valA = typeof a[valueKey] === 'number' ? a[valueKey] : 0;
      const valB = typeof b[valueKey] === 'number' ? b[valueKey] : 0;
      return valB - valA;
    });
  }

  if (typeof limit === 'number' && limit > 0) {
    processedData = processedData.slice(0, limit);
  }

  const labels = processedData.map((item) => String(item[labelKey] ?? ''));
  const values = processedData.map((item) => {
    const val = item[valueKey];
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  });

  return [
    {
      name: seriesName,
      labels,
      values,
    },
  ];
};

/**
 * Подготавливает данные для нескольких серий (например, сравнение по годам)
 * Пример входа:
 * [
 *   { category: 'A', series1: 10, series2: 20 },
 *   { category: 'B', series1: 15, series2: 25 }
 * ]
 *
 * @param {Array} data - Массив объектов с общей меткой и несколькими значениями
 * @param {string} labelKey - Ключ общей метки (например, 'category')
 * @param {Array<{ key: string, name: string }>} series - Массив серий: [{ key: 'series1', name: '2023' }, ...]
 * @param {number} [limit] - Максимальное количество элементов (опционально)
 * @param {string} [sortBySeriesKey] - Ключ серии, по которой сортировать (опционально)
 * @param {boolean} [sortDesc=false] - Сортировать по убыванию (по умолчанию false)
 * @returns {Array} - Массив серий в формате pptxgenjs
 */
export const prepareMultiSeriesXYChartData = (
  data,
  labelKey,
  series,
  limit,
  sortBySeriesKey,
  sortDesc = true,
) => {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(series)) {
    return [];
  }

  let processedData = [...data];

  if (sortBySeriesKey) {
    processedData = processedData.sort((a, b) => {
      const valA = typeof a[sortBySeriesKey] === 'number' ? a[sortBySeriesKey] : 0;
      const valB = typeof b[sortBySeriesKey] === 'number' ? b[sortBySeriesKey] : 0;
      return sortDesc ? valB - valA : valA - valB;
    });
  }

  if (typeof limit === 'number' && limit > 0) {
    processedData = processedData.slice(0, limit);
  }

  const labels = processedData.map((item) => String(item[labelKey] ?? ''));
  return series.map(({ key, name }) => ({
    name,
    labels,
    values: processedData.map((item) => {
      const val = item[key];
      return typeof val === 'number' && !isNaN(val) ? val : 0;
    }),
  }));
};

/**
 * Подготавливает данные для круговых диаграмм (pie, doughnut)
 *
 * @param {Array} data - Массив объектов
 * @param {string} labelKey - Ключ для названия сегмента
 * @param {string} valueKey - Ключ для числового значения
 * @param {number} [limit] - Максимальное количество сегментов (опционально)
 * @param {boolean} [sortDesc=false] - Сортировать по убыванию значения (по умолчанию false)
 * @returns {Array} - Формат: [{ name: 'Label', value: number }, ...]
 */
export const preparePieChartData = (data, labelKey, valueKey, limit, sortDesc = true) => {
  if (!Array.isArray(data)) return [];

  let processedData = [...data];

  if (sortDesc) {
    processedData = processedData.sort((a, b) => {
      const valA = typeof a[valueKey] === 'number' ? a[valueKey] : 0;
      const valB = typeof b[valueKey] === 'number' ? b[valueKey] : 0;
      return valB - valA;
    });
  }

  if (typeof limit === 'number' && limit > 0) {
    processedData = processedData.slice(0, limit);
  }

  return processedData.map((item) => ({
    name: String(item[labelKey] ?? ''),
    value: typeof item[valueKey] === 'number' && !isNaN(item[valueKey]) ? item[valueKey] : 0,
  }));
};

/**
 * Подготавливает данные для пузырьковой диаграммы (bubble)
 * Каждый элемент: [x, y, size]
 *
 * @param {Array} data - Массив объектов
 * @param {string} xKey - Ключ для X
 * @param {string} yKey - Ключ для Y
 * @param {string} sizeKey - Ключ для размера пузырька
 * @param {string} seriesName - Название серии
 * @param {number} [limit] - Максимальное количество элементов (опционально)
 * @param {string} [sortBy=sizeKey] - Ключ для сортировки (по умолчанию sizeKey)
 * @param {boolean} [sortDesc=false] - Сортировать по убыванию (по умолчанию false)
 * @returns {Array} - [{ name, labels: [...], values: [[x,y,size], ...] }]
 */
export const prepareBubbleChartData = (
  data,
  xKey,
  yKey,
  sizeKey,
  seriesName = 'Series',
  limit,
  sortBy = sizeKey,
  sortDesc = true,
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [{ name: seriesName, labels: [], values: [] }];
  }

  let processedData = [...data];

  if (sortBy) {
    processedData = processedData.sort((a, b) => {
      const valA = typeof a[sortBy] === 'number' ? a[sortBy] : 0;
      const valB = typeof b[sortBy] === 'number' ? b[sortBy] : 0;
      return sortDesc ? valB - valA : valA - valB;
    });
  }

  if (typeof limit === 'number' && limit > 0) {
    processedData = processedData.slice(0, limit);
  }

  const labels = processedData.map((item) => `${item[xKey] ?? ''}, ${item[yKey] ?? ''}`);
  const values = processedData.map((item) => [
    typeof item[xKey] === 'number' ? item[xKey] : 0,
    typeof item[yKey] === 'number' ? item[yKey] : 0,
    typeof item[sizeKey] === 'number' ? item[sizeKey] : 0,
  ]);

  return [
    {
      name: seriesName,
      labels,
      values,
    },
  ];
};
