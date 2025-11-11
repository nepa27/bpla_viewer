import dayjs from 'dayjs';
import 'dayjs/locale/ru';

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
 * @param {string} dateStr Дата в ISO формате
 * @returns {string} Текущая дата в формате DD.MM.YYYY (например, "25.12.2023")
 */
export function getDateNow(dateStr = Date.now()) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы с 0 до 11
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Получает текущую дату в формате YYYY-MM-DD => DD.MM.YYYY
 * @param {string} dateStr Дата в формате YYYY-MM-DD
 * @returns {string} Дата в формате DD.MM.YYYY (например, "25.12.2023")
 */
export function rebuildDateView(dateStr = '') {
  const [year, month, day] = dateStr.split('-');
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

export function compareDates(a, b) {
  // Для формата DD.MM.YYYY
  if (typeof a === 'string' && typeof b === 'string' && a.includes('.') && b.includes('.')) {
    // Сравнение дат в формате DD.MM.YYYY
    return new Date(a) - new Date(b);
  }

  // Разделение строки на день и месяц для старого формата
  const [dayA, monthA] = a.split(':').map(Number);
  const [dayB, monthB] = b.split(':').map(Number);

  // Преобразование даты в общее число для сравнения
  const dateValueA = monthA * 100 + dayA;
  const dateValueB = monthB * 100 + dayB;

  return dateValueA - dateValueB;
}

/**
 * Форматирование длительности в человекочитаемый формат
 * @param {number} minutes количество минут
 * @returns {string} Количество дней в формате DD д HH ч (например, "3 д 20 ч") || HH ч MM мин (например, "3 ч 20 мин")
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} мин`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours} ч ${mins} мин`;
  } else {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return `${days} д ${hours} ч`;
  }
}

/**
 * Форматирования минут в часы
 * @param {number} minutes количество минут
 * @returns {string} Количество часов HH ч (например, "3 ч")
 */
export const formatAxisHours = (minutes) => {
  const hours = Math.round(minutes / 60);
  return `${hours} ч`;
};

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

/**
 * Агрегирует данные по месяцам
 * @param {Array} dailyData - Массив вида [{ date: Date, count: number }, ...]
 * @returns {Array} - Массив вида [{ monthLabel: 'Январь 2025', total: 123 }, ...]
 */
export const aggregateByMonth = (dailyData) => {
  if (!Array.isArray(dailyData)) return [];

  const monthMap = new Map();

  dailyData.forEach((item) => {
    const date = new Date(item.date);
    // Формат: "Январь 2025"
    const monthLabel = date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    });

    const current = monthMap.get(monthLabel) || 0;
    monthMap.set(monthLabel, current + (item.count || 0));
  });

  // Преобразуем Map в массив и сортируем по дате (опционально)
  const result = Array.from(monthMap, ([monthLabel, total]) => ({
    monthLabel,
    total,
  }));

  // Сортировка по хронологии (не по алфавиту!)
  result.sort((a, b) => {
    const dateA = new Date(a.monthLabel.split(' ')[1], getMonthIndex(a.monthLabel));
    const dateB = new Date(b.monthLabel.split(' ')[1], getMonthIndex(b.monthLabel));
    return dateA - dateB;
  });

  return result;
};

// Вспомогательная функция для получения индекса месяца из названия на русском
const getMonthIndex = (monthLabel) => {
  const monthNames = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ];
  const name = monthLabel.toLowerCase().split(' ')[0];
  return monthNames.indexOf(name);
};

/**
 * Преобразует массив дат в формат {from: дата название месяца год, to: дата название месяца год}
 * @param {Array} dates - Массив дат в формате dayjs объектов или строк
 * @returns {Object} Объект с полями from и to в нужном формате
 */
export function convertDatesToReadableFormat(dates) {
  if (!Array.isArray(dates) || dates.length < 2) {
    throw new Error('Необходимо передать массив из двух дат');
  }

  const [fromDate, toDate] = dates;

  // Устанавливаем локаль на русский язык
  const fromDayjs = dayjs.isDayjs(fromDate) ? fromDate.locale('ru') : dayjs(fromDate).locale('ru');
  const toDayjs = dayjs.isDayjs(toDate) ? toDate.locale('ru') : dayjs(toDate).locale('ru');

  return {
    from: fromDayjs.format('DD MMMM YYYY'),
    to: toDayjs.format('DD MMMM YYYY'),
  };
}

export const getUpperCaseStartedWord = (word) => {
  if (!word) return;
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
};

export function setCookiesFromHeader(cookieHeader) {
  // Разбиваем заголовок на отдельные куки (если их несколько)
  const cookies = cookieHeader.split(', ');

  cookies.forEach((cookie) => {
    // Парсим каждую куку
    const [cookiePart, ...restParts] = cookie.split('; ');

    if (!cookiePart) return;

    // Разбиваем имя и значение
    const [name, value] = cookiePart.split('=');

    // Объект для параметров куки
    let options = {
      name,
      value: decodeURIComponent(value),
      path: '/',
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: null,
      expires: null,
    };

    // Парсим остальные параметры
    restParts.forEach((part) => {
      const [key, value] = part.split('=');

      switch (key.toLowerCase()) {
        case 'path':
          options.path = value;
          break;
        case 'secure':
          options.secure = true;
          break;
        case 'httponly':
          options.httpOnly = true;
          break;
        case 'samesite':
          options.sameSite = value.toLowerCase();
          break;
        case 'max-age':
          options.maxAge = parseInt(value, 10);
          break;
        case 'expires':
          options.expires = new Date(value);
          break;
      }
    });

    // Формируем строку для установки куки
    const cookieStr = `${options.name}=${encodeURIComponent(options.value)}`;

    // Добавляем параметры
    let optionsStr = '';
    if (options.path) optionsStr += `; Path=${options.path}`;
    if (options.secure) optionsStr += '; Secure';
    if (options.httpOnly) optionsStr += '; HttpOnly';
    if (options.sameSite) optionsStr += `; SameSite=${options.sameSite.toUpperCase()}`;
    if (typeof options.maxAge === 'number') optionsStr += `; Max-Age=${options.maxAge}`;
    if (options.expires instanceof Date) optionsStr += `; Expires=${options.expires.toUTCString()}`;

    // Устанавливаем куку
    document.cookie = cookieStr + optionsStr;
  });
}
