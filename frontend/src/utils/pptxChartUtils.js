/**
 * Добавляет горизонтальную bar-диаграмму на слайд
 *
 * @param {Object} slide - Слайд из pptxgenjs
 * @param {Array} chartData - Данные в формате [{ name, labels: [...], values: [...] }]
 * @param {Object} options - Настройки диаграммы
 * @param {string} [options.title] - Заголовок над диаграммой
 * @param {string} [options.color='#4A90E2'] - Цвет столбцов (один цвет)
 * @param {boolean} [options.showValues=true] - Показывать числа на столбцах
 * @param {number} [options.x=0.3] - Позиция X
 * @param {number} [options.y=1.3] - Позиция Y
 * @param {string|number} [options.w='94%'] - Ширина
 * @param {number} [options.h=5.8] - Высота
 */
export const addHorizontalBarChart = (
  slide,
  chartData,
  { title = '', color = '#4A90E2', showValues = true, x = 0.3, y = 1.3, w = '94%', h = 5.8 } = {},
) => {
  // Добавляем заголовок над диаграммой (если указан)
  if (title) {
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.6,
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });
  }

  // Настройки диаграммы
  const chartOptions = {
    x,
    y,
    w,
    h,
    chartColors: [color],
    showValue: showValues,
    showPercent: false,
    valAxisLabelFontSize: 9,
    catAxisLabelFontSize: 9,
    catAxisLabelColor: '333333',
    valAxisLabelColor: '555555',
    catAxisOrientation: 'minMax',
    hasLegend: false,
  };

  // Добавляем диаграмму
  slide.addChart('bar', chartData, chartOptions);
};

/**
 * Добавляет вертикальную столбчатую диаграмму (column chart) на слайд
 *
 * @param {Object} slide - Слайд из pptxgenjs
 * @param {Array} chartData - Данные в формате [{ name, labels: [...], values: [...] }]
 * @param {Object} options - Настройки диаграммы
 * @param {string} [options.title] - Заголовок над диаграммой
 * @param {string} [options.color='#4A90E2'] - Цвет столбцов (один цвет)
 * @param {boolean} [options.showValues=true] - Показывать числа на столбцах
 * @param {number} [options.x=0.3] - Позиция X
 * @param {number} [options.y=1.3] - Позиция Y
 * @param {string|number} [options.w='94%'] - Ширина
 * @param {number} [options.h=5.8] - Высота
 */
export const addVerticalBarChart = (
  slide,
  chartData,
  { title = '', color = '#4A90E2', showValues = true, x = 0.3, y = 1.3, w = '94%', h = 5.8 } = {},
) => {
  // Добавляем заголовок над диаграммой (если указан)
  if (title) {
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.6,
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });
  }

  // Настройки диаграммы — тип 'column' для вертикальных столбцов
  const chartOptions = {
    x,
    y,
    w,
    h,
    chartColors: [color],
    showValue: showValues,
    showPercent: false,
    valAxisLabelFontSize: 9,
    catAxisLabelFontSize: 9,
    catAxisLabelColor: '333333',
    valAxisLabelColor: '555555',
    catAxisOrientation: 'minMax',
    hasLegend: false,
  };

  // Используем тип 'column' — вертикальные столбцы
  slide.addChart('column', chartData, chartOptions);
};

/**
 * Добавляет горизонтальную bar-диаграмму на слайд
 *
 * @param {Object} slide - Слайд из pptxgenjs
 * @param {Array} chartData - Данные в формате [{ name, labels: [...], values: [...] }]
 * @param {string} type - Тип диаграммы  'bar' || 'column'
 * @param {Object} options - Настройки диаграммы
 * @param {string} [options.title] - Заголовок над диаграммой
 * @param {string} [options.color='#4A90E2'] - Цвет столбцов (один цвет)
 * @param {boolean} [options.showValues=true] - Показывать числа на столбцах
 * @param {number} [options.x=0.3] - Позиция X
 * @param {number} [options.y=1.3] - Позиция Y
 * @param {string|number} [options.w='94%'] - Ширина
 * @param {number} [options.h=5.8] - Высота
 */
export const addBarChart = (
  slide,
  chartData,
  type = 'bar',
  { title = '', color = '#4A90E2', showValues = true, x = 0.3, y = 1.3, w = '94%', h = 5.8 } = {},
) => {
  // Добавляем заголовок над диаграммой (если указан)
  if (title) {
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.6,
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });
  }

  // Настройки диаграммы
  const chartOptions = {
    x,
    y,
    w,
    h,
    chartColors: [color],
    showValue: showValues,
    showPercent: false,
    valAxisLabelFontSize: 9,
    catAxisLabelFontSize: 9,
    catAxisLabelColor: '333333',
    valAxisLabelColor: '555555',
    catAxisOrientation: 'minMax',
    hasLegend: false,
  };

  // Добавляем диаграмму
  slide.addChart(type, chartData, chartOptions);
};
