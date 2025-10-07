import { aggregateByMonth, prepareXYChartData } from './functions';
import { addHorizontalBarChart } from './pptxChartUtils';

const PPTX_CONFIG = {
  LAYOUT: 'LAYOUT_WIDE',
  AUTHOR: 'NepSeudoCode',
  COMPANY: 'NepSeudoCode',
};

// ==============================
// ОПЦИИ ДЛЯ СТРАНИЦЫ РЕГИОНА
// ==============================
export const exportOptionsRegion = [
  { value: 'all-region', label: 'Все графики (регион)' },
  { value: 'daily', label: 'Полёты по датам' },
  { value: 'duration-by-date', label: 'Суммарная длительность' },
  { value: 'peak', label: 'Пиковая нагрузка' },
  { value: 'timeofday', label: 'По часам суток' },
  { value: 'stats', label: 'Общая статистика' },
];

// ==============================
// Вспомогательная функция: добавить заглавный слайд для региона
// ==============================
const addRegionTitleSlide = (pptx, regionName, date) => {
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '002B5B' };

  titleSlide.addText('Статистика полетов', {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.2,
    fontSize: 32,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    fontFace: 'Arial',
  });
  titleSlide.addText(regionName, {
    x: 0.5,
    y: 2.6,
    w: '90%',
    h: 1.2,
    fontSize: 46,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    fontFace: 'Arial',
  });

  const periodText = `Период: c ${date.from}г. по ${date.to}г.`;
  titleSlide.addText(periodText, {
    x: 0.5,
    y: 4.5,
    w: '90%',
    h: 0.6,
    fontSize: 18,
    color: 'E0E0E0',
    align: 'center',
    fontFace: 'Arial',
  });
};

// ==============================
// Экспорт статистики как текст
// ==============================
const addStatisticsSlide = (pptx, statistics, date) => {
  const slide = pptx.addSlide();
  slide.background = { color: 'F8F9FA' };

  // Параметры слайда (широкоформатный: ~13.33" x 7.5")
  const slideWidth = 13.33;
  const slideHeight = 7.5;
  const margin = 0.7; // отступы со всех сторон (в дюймах)

  const contentWidth = slideWidth - 2 * margin; // ~11.93"
  const contentX = margin; // начальная позиция по X

  // Заголовок
  slide.addText('📊 Сводная статистика', {
    x: contentX,
    y: margin,
    w: contentWidth,
    fontSize: 26,
    bold: true,
    color: '002B5B',
    align: 'center',
    fontFace: 'Arial',
  });

  // Период
  const periodText = `Период: ${date.from} – ${date.to} гг.`;
  slide.addText(periodText, {
    x: contentX,
    y: margin + 0.4,
    w: contentWidth,
    fontSize: 16,
    color: '555555',
    align: 'center',
    italic: true,
  });

  // Данные — начинаем ниже заголовка и периода
  const startY = margin + 0.9; // ~1.6"
  const rowHeight = 0.7;
  const iconOffsetX = 0.0;
  const labelOffsetX = 0.7;
  const valueOffsetX = contentWidth - 2.0; // отступ справа

  const stats = [
    { icon: '✈️', label: 'Общее количество полётов', value: statistics.totalFlights },
    { icon: '⏱️', label: 'Средняя длительность полёта', value: statistics.averageFlightDuration },
    { icon: '📅', label: 'Дней без полётов', value: statistics.daysWithoutFlights },
  ];

  stats.forEach((item, i) => {
    const y = startY + i * rowHeight;
    if (y + rowHeight > slideHeight - margin) return; // защита от выхода за низ

    // Иконка
    slide.addText(item.icon, {
      x: contentX + iconOffsetX,
      y: y,
      fontSize: 22,
      color: '4A90E2',
    });

    // Название метрики
    slide.addText(item.label, {
      x: contentX + labelOffsetX,
      y: y + 0.05,
      w: valueOffsetX - labelOffsetX - 0.5, // ширина до значения
      fontSize: 15,
      color: '333333',
    });

    // Значение (справа)
    slide.addText(String(item.value), {
      x: contentX + valueOffsetX,
      y: y,
      w: 2.0,
      fontSize: 18,
      color: '002B5B',
      bold: true,
      align: 'right',
    });
  });

  // Подпись внизу
  slide.addText('Источник: Система аналитики полётов', {
    x: contentX,
    y: slideHeight - margin + 0.1,
    w: contentWidth,
    fontSize: 10,
    color: '888888',
    align: 'center',
  });
};

// ==============================
// Подготовка данных для линейной диаграммы
// ==============================
const prepareLineChartData = (data, xKey, yKey, seriesName = 'Series') => {
  if (!Array.isArray(data) || data.length === 0) {
    return [{ name: seriesName, labels: [], values: [] }];
  }

  const validData = data
    .map((item) => {
      let xValue = item[xKey];
      if (xValue == null) return null;

      let date;
      if (xValue instanceof Date) {
        date = xValue;
      } else if (typeof xValue === 'string') {
        date = new Date(xValue);
      } else {
        return null;
      }

      if (isNaN(date.getTime())) return null;

      const yValue = item[yKey];
      if (typeof yValue !== 'number' || isNaN(yValue)) return null;

      return { date, yValue };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (validData.length === 0) {
    return [{ name: seriesName, labels: [], values: [] }];
  }

  const labels = validData.map((item) =>
    item.date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
  );
  const values = validData.map((item) => item.yValue);

  return [{ name: seriesName, labels, values }];
};

export const exportMonthlyChart = async (dailyFlights, date, regionName = '') => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    const monthlyFlights = aggregateByMonth(dailyFlights);
    const barData = prepareXYChartData(
      monthlyFlights,
      'monthLabel',
      'total',
      'Полёты по месяцам',
      Infinity,
      false,
    );

    addHorizontalBarChart(slide, barData, {
      title: 'Количество полетов по месяцам',
      color: '#FF6F61',
    });

    pptx.writeFile({
      fileName: `flight_daily_${regionName}.pptx`,
    });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта по месяцам:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Экспорт: Полёты по датам (линейная)
// ==============================
export const exportDailyFlightsChart = async (regionName, dailyFlights, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.layout = PPTX_CONFIG.LAYOUT;
    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    const chartData = prepareLineChartData(dailyFlights, 'date', 'count', 'Полёты');
    slide.addChart('line', chartData, {
      x: 0.3,
      y: 1.0,
      w: '94%',
      h: 5.5,
      title: 'Количество полетов по датам',
      titleFontSize: 20,
      titleColor: '002B5B',
      chartColors: ['#4A90E2'],
      showValue: false,
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 10,
    });

    pptx.writeFile({ fileName: `flight_daily_${regionName}.pptx` });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта daily:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Экспорт: Пиковая нагрузка (линейная)
// ==============================
export const exportPeakFlightsChart = async (regionName, peakHourlyFlights, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    slide.addText('Пиковая нагрузка по дням', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });

    const chartData = prepareLineChartData(peakHourlyFlights, 'date', 'maxFlights', 'Пик');
    slide.addChart('line', chartData, {
      x: 0.3,
      y: 1.1,
      w: '94%',
      h: 5.4,
      chartColors: ['#FF6F61'],
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 9,
    });

    pptx.writeFile({ fileName: `flight_peak_${regionName}.pptx` });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта peak:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Экспорт: Распределение по часам (круговая)
// ==============================
export const exportTimeOfDayChart = async (regionName, flightsByTimeOfDay, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    if (
      !flightsByTimeOfDay ||
      !Array.isArray(flightsByTimeOfDay) ||
      flightsByTimeOfDay.length === 0
    ) {
      console.error('Нет данных для pie-диаграммы');
      return { success: false, error: 'Нет данных для диаграммы' };
    }

    const totalFlights = flightsByTimeOfDay.reduce((sum, item) => sum + item.value, 0);

    // Формируем данные с процентами
    const chartData = [
      {
        name: 'Распределение полетов',
        labels: flightsByTimeOfDay.map((item) => {
          const percentage = ((item.value / totalFlights) * 100).toFixed(1);
          return `${item.label} (${percentage}%)`;
        }),
        values: flightsByTimeOfDay.map((item) => item.value),
      },
    ];

    slide.addText('Распределение полетов по часам суток', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });

    slide.addChart('pie', chartData, {
      x: 3.5,
      y: 1.5,
      w: 7.0,
      h: 4.5,
      title: '',
      titleFontSize: 0,
      titleColor: '002B5B',
      showLegend: true,
      legendPos: 'r',
      chartColors: ['#4A90E2', '#50C878', '#FF6F61', '#FFD700', '#9370DB', '#FF69B4'],
      valLabelFontSize: 14,
      catLabelFontSize: 14,
      showPercent: true,
      holeSize: 0.3,
      v3D: true,
      rotationX: 15,
      rotationY: 15,
      legendFontSize: 14,
      dataLabelFontSize: 14,
    });

    // Параметры слайда (широкоформатный: ~13.33" x 7.5")
    // Подпись внизу
    const slideWidth = 13.33;
    const slideHeight = 7.5;
    const margin = 1.3;

    const contentWidth = slideWidth - 2 * margin; // ~11.93"
    const contentX = margin;

    const explanationText = `Всего полетов: ${totalFlights}`;
    slide.addText(explanationText, {
      x: contentX,
      y: slideHeight - margin + 0.1,
      w: contentWidth,
      fontSize: 10,
      color: '888888',
      align: 'center',
    });

    pptx.writeFile({ fileName: `flight_timeofday_${regionName}.pptx` });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта time of day:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Экспорт: Статистика (текст)
// ==============================
export const exportStatisticsSlide = async (regionName, statistics, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

    // Только один слайд — статистика (без общего заглавного)
    addStatisticsSlide(pptx, statistics, date);

    pptx.writeFile({ fileName: `flight_statistics_${regionName}.pptx` });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта статистики:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Экспорт всех графиков региона
// ==============================
export const exportAllRegionCharts = async (
  regionName,
  { dailyFlights, peakHourlyFlights, flightsByTimeOfDay, statistics, flightDurationByDate },
  date,
) => {
  if (!statistics) {
    console.warn('Статистика отсутствует');
    return { success: false, error: 'Нет данных статистики' };
  }
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

    addRegionTitleSlide(pptx, regionName, date);
    addStatisticsSlide(pptx, statistics, date);

    // Слайд: Полёты по датам
    const slide1 = pptx.addSlide();
    slide1.background = { color: 'FFFFFF' };

    const monthlyFlights = aggregateByMonth(dailyFlights);
    const data1 = prepareXYChartData(
      monthlyFlights,
      'monthLabel',
      'total',
      'Полёты по месяцам',
      Infinity,
      false,
    );

    addHorizontalBarChart(slide1, data1, {
      title: 'Количество полетов по месяцам',
      color: '#FF6F61',
    });

    // Слайд: Суммарная длительность по датам
    const slide2 = pptx.addSlide();
    slide2.background = { color: 'FFFFFF' };

    slide2.addText('Суммарная длительность полетов по датам', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });

    const data3 = prepareLineChartData(flightDurationByDate || [], 'date', 'value', 'Длительность');

    slide2.addChart('line', data3, {
      x: 0.3,
      y: 1.1,
      w: '94%',
      h: 5.4,
      chartColors: ['#50C878'],
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 9,
    });

    // Слайд: Пиковая нагрузка
    const slide3 = pptx.addSlide();
    slide3.background = { color: 'FFFFFF' };

    slide3.addText('Пиковая нагрузка по дням', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });

    const data2 = prepareLineChartData(peakHourlyFlights, 'date', 'maxFlights', 'Пик');

    slide3.addChart('line', data2, {
      x: 0.3,
      y: 1.1,
      w: '94%',
      h: 5.4,
      chartColors: ['#FF6F61'],
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 9,
    });

    // Слайд: По часам суток
    const slide4 = pptx.addSlide();
    slide4.background = { color: 'FFFFFF' };

    if (
      !flightsByTimeOfDay ||
      !Array.isArray(flightsByTimeOfDay) ||
      flightsByTimeOfDay.length === 0
    ) {
      console.error('Нет данных для pie-диаграммы');
      return { success: false, error: 'Нет данных для диаграммы' };
    }

    // Рассчитываем общее количество полетов для процентов
    const totalFlights = flightsByTimeOfDay.reduce((sum, item) => sum + item.value, 0);

    // Формируем данные с процентами для отображения
    const pieData = [
      {
        name: 'Распределение полетов',
        labels: flightsByTimeOfDay.map((item) => {
          const percentage = ((item.value / totalFlights) * 100).toFixed(1);
          return `${item.label} (${percentage}%)`;
        }),
        values: flightsByTimeOfDay.map((item) => item.value),
      },
    ];

    slide4.addText('Распределение полетов по часам суток', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });

    slide4.addChart('pie', pieData, {
      x: 3.5,
      y: 1.5,
      w: 7.0,
      h: 4.5,
      title: '',
      titleFontSize: 0,
      titleColor: '002B5B',
      showLegend: true,
      legendPos: 'r',
      chartColors: ['#FFD700', '#50C878', '#FF6F61', '#4A90E2', '#9370DB', '#FF69B4'],
      valLabelFontSize: 14,
      catLabelFontSize: 14,
      showPercent: true,
      holeSize: 0.3,
      v3D: true,
      rotationX: 15,
      rotationY: 15,
      legendFontSize: 14,
      dataLabelFontSize: 14,
    });

    // Параметры слайда (широкоформатный: ~13.33" x 7.5")
    // Подпись внизу
    const slideWidth = 13.33;
    const slideHeight = 7.5;
    const margin = 1.3; // отступы со всех сторон (в дюймах)

    const contentWidth = slideWidth - 2 * margin; // ~11.93"
    const contentX = margin; // начальная позиция по X

    const explanationText = `Всего полетов: ${totalFlights}`;
    slide4.addText(explanationText, {
      x: contentX,
      y: slideHeight - margin + 0.1,
      w: contentWidth,
      fontSize: 10,
      color: '888888',
      align: 'center',
    });

    pptx.writeFile({ fileName: `flight_all_${regionName}.pptx` });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта всех графиков региона:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Экспорт: Суммарная длительность полетов по датам (линейная)
// ==============================
export const exportDurationByDateChart = async (regionName, flightDurationByDate, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.layout = PPTX_CONFIG.LAYOUT;
    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    slide.addText('Суммарная длительность полетов по датам', {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
      fontFace: 'Arial',
    });

    if (
      !flightDurationByDate ||
      !Array.isArray(flightDurationByDate) ||
      flightDurationByDate.length === 0
    ) {
      console.warn('Нет данных для экспорта суммарной длительности');
      slide.addText('Нет данных для отображения', {
        x: 0.5,
        y: 3.0,
        w: 9,
        h: 1.0,
        fontSize: 16,
        color: 'FF0000',
        align: 'center',
      });

      pptx.writeFile({ fileName: `flight_duration_by_date_${regionName}.pptx` });
      return { success: true };
    }

    // Готовые данные — используем напрямую
    const chartData = prepareLineChartData(
      flightDurationByDate,
      'date',
      'value', // ← ключ из flightDurationByDate
      'Длительность',
    );

    slide.addChart('line', chartData, {
      x: 0.3,
      y: 1.1,
      w: '94%',
      h: 5.4,
      chartColors: ['#50C878'],
      valAxisLabelFontSize: 10,
      catAxisLabelFontSize: 9,
    });

    pptx.writeFile({ fileName: `flight_duration_by_date_${regionName}.pptx` });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта duration by date:', error);
    return { success: false, error: error.message };
  }
};
// ==============================
// Универсальный экспорт для региона
// ==============================
export const exportRegionChartByType = async (type, regionName, chartsData, date) => {
  const { dailyFlights, peakHourlyFlights, flightsByTimeOfDay, statistics, flightDurationByDate } =
    chartsData;

  switch (type) {
    case 'daily':
      return exportMonthlyChart(dailyFlights, date, regionName);
    case 'peak':
      return exportPeakFlightsChart(regionName, peakHourlyFlights, date);
    case 'timeofday':
      return exportTimeOfDayChart(regionName, flightsByTimeOfDay, date);
    case 'duration-by-date':
      return exportDurationByDateChart(regionName, flightDurationByDate, date);
    case 'stats':
      return exportStatisticsSlide(regionName, statistics, date);
    case 'all-region':
    default:
      return exportAllRegionCharts(regionName, chartsData, date);
  }
};
