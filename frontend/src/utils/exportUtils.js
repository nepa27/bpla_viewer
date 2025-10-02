// src/utils/exportUtils.js
import { aggregateByMonth, prepareXYChartData } from './functions';
import { addHorizontalBarChart, addVerticalBarChart } from './pptxChartUtils';

// ==============================
// 1. Опции для выпадающего списка
// ==============================
export const exportOptions = [
  { value: 'all', label: 'Все графики' },
  { value: 'regions', label: 'Полёты по регионам' },
  { value: 'duration', label: 'Длительность по регионам' },
  { value: 'monthly', label: 'Полёты по месяцам' },
];

// ==============================
// 2. Вспомогательная функция: добавить заглавный слайд
// ==============================
const addTitleSlide = (pptx, date) => {
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '002B5B' };

  titleSlide.addText('Статистика полетов', {
    x: 0.5,
    y: 2.5,
    w: '90%',
    h: 1.2,
    fontSize: 44,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    fontFace: 'Arial',
  });

  const periodText = `Период: c ${date.from}г. по ${date.to}г.`;
  titleSlide.addText(periodText, {
    x: 0.5,
    y: 4.0,
    w: '90%',
    h: 0.6,
    fontSize: 20,
    color: 'E0E0E0',
    align: 'center',
    fontFace: 'Arial',
  });
};

// ==============================
// 3. Экспорт отдельных графиков (каждая функция сама создаёт pptx)
// ==============================

export const exportRegionsChart = async (chartsData, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';
    pptx.layout = 'LAYOUT_WIDE';

    addTitleSlide(pptx, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    const barData = prepareXYChartData(
      chartsData.flightsByRegion,
      'region',
      'count',
      'Полёты по регионам',
      10,
      true,
    );

    addHorizontalBarChart(slide, barData, {
      title: 'Топ-10 регионов по количеству полётов',
      color: '#4A90E2',
    });

    pptx.writeFile({ fileName: 'flight_statistics_regions.pptx' });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта регионов:', error);
    return { success: false, error: error.message };
  }
};

export const exportDurationChart = async (chartsData, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';
    pptx.layout = 'LAYOUT_WIDE';

    addTitleSlide(pptx, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    const barData = prepareXYChartData(
      chartsData.flightsDurationByRegion,
      'region',
      'totalDurationMinutes',
      'Длительность полётов',
      10,
      true,
    );

    addHorizontalBarChart(slide, barData, {
      title: 'Топ-10 регионов по суммарной длительности полётов',
      color: '#50C878',
    });

    pptx.writeFile({ fileName: 'flight_statistics_duration.pptx' });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта длительности:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// 4. Экспорт всех графиков
// ==============================
export const exportMonthlyChart = async (dailyFlights, date, regionName = '') => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';
    pptx.layout = 'LAYOUT_WIDE';

    regionName ? addRegionTitleSlide(pptx, regionName, date) : addTitleSlide(pptx, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    const monthlyFlights = aggregateByMonth(dailyFlights); // Теперь dailyFlights - это массив
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
      fileName: regionName ? `flight_daily_${regionName}.pptx` : 'flight_statistics_monthly.pptx',
    });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта по месяцам:', error);
    return { success: false, error: error.message };
  }
};

export const exportChartsToPPTX = async (
  chartsData,
  fileName = 'flight_statistics_all.pptx',
  date,
) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';
    pptx.layout = 'LAYOUT_WIDE';

    addTitleSlide(pptx, date);

    // Слайд 2: Регионы
    const slide1 = pptx.addSlide();
    slide1.background = { color: 'FFFFFF' };
    const barData1 = prepareXYChartData(
      chartsData.flightsByRegion,
      'region',
      'count',
      'Полёты',
      10,
      true,
    );
    addHorizontalBarChart(slide1, barData1, {
      title: 'Топ-10 регионов по количеству полётов',
      color: '#4A90E2',
    });

    // Слайд 3: Длительность
    const slide2 = pptx.addSlide();
    slide2.background = { color: 'FFFFFF' };
    const barData2 = prepareXYChartData(
      chartsData.flightsDurationByRegion,
      'region',
      'totalDurationMinutes',
      'Длительность',
      10,
      true,
    );
    addHorizontalBarChart(slide2, barData2, {
      title: 'Топ-10 регионов по суммарной длительности полётов',
      color: '#4A90E2',
    });

    // Слайд 4: Месяцы
    const slide3 = pptx.addSlide();
    slide3.background = { color: 'FFFFFF' };
    const monthlyFlights = aggregateByMonth(chartsData.dailyFlights);
    const barData3 = prepareXYChartData(
      monthlyFlights,
      'monthLabel',
      'total',
      'Месяцы',
      Infinity,
      false,
    );
    addHorizontalBarChart(slide3, barData3, {
      title: 'Количество полетов по месяцам',
      color: '#4A90E2',
    });

    pptx.writeFile({ fileName });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта всех графиков:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// 5. Универсальный экспорт по типу
// ==============================
export const exportChartByType = async (type, chartsData, date) => {
  switch (type) {
    case 'regions':
      return exportRegionsChart(chartsData, date);
    case 'duration':
      return exportDurationChart(chartsData, date);
    case 'monthly':
      // return exportMonthlyChart(chartsData, date);
      return exportMonthlyChart(chartsData.dailyFlights, date);
    case 'all':
    default:
      return exportChartsToPPTX(chartsData, 'flight_statistics_all.pptx', date);
  }
};

// ==============================
// НОВЫЕ ОПЦИИ ДЛЯ СТРАНИЦЫ РЕГИОНА
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

  titleSlide.addText(`Статистика полетов: ${regionName}`, {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.2,
    fontSize: 36,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    fontFace: 'Arial',
  });

  const periodText = `Период: c ${date.from}г. по ${date.to}г.`;
  titleSlide.addText(periodText, {
    x: 0.5,
    y: 3.5,
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
      // Обработка x (дата)
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

      // Обработка y (число)
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
// ==============================
// Экспорт: Полёты по датам (линейная)
// ==============================
export const exportDailyFlightsChart = async (regionName, dailyFlights, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';

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
    pptx.layout = 'LAYOUT_WIDE';

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // 🔹 Добавляем ЗАГОЛОВОК как отдельный текст (гарантированно виден)
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
      y: 1.1, // ← немного выше, т.к. заголовок теперь отдельно
      w: '94%',
      h: 5.4,
      // УБРАЛИ встроенный title — он не работает надёжно для line-графиков
      chartColors: ['#FF6F61'],
      showValue: true,
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
    pptx.layout = 'LAYOUT_WIDE';

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Проверяем данные
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

    // Добавляем заголовок диаграммы
    slide.addText('Распределение полетов по часам суток', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.5,
      fontSize: 20,
      color: '002B5B',
      bold: true,
      align: 'center',
    });

    slide.addChart('pie', chartData, {
      x: 1.5, // Центрирование по горизонтали
      y: 1.5,
      w: 7.0, // Увеличенная ширина для лучшего отображения
      h: 4.5,
      title: '',
      titleFontSize: 0,
      titleColor: '002B5B',
      showLegend: true,
      legendPos: 'r',
      chartColors: ['#4A90E2', '#50C878', '#FF6F61', '#FFD700', '#9370DB', '#FF69B4'],
      showValue: true,
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

    // Добавляем пояснение под диаграммой
    const explanationText = `Всего полетов: ${totalFlights}`;
    slide.addText(explanationText, {
      x: 0.5,
      y: 6.2,
      w: 9,
      h: 0.3,
      fontSize: 12,
      color: '666666',
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
    pptx.layout = 'LAYOUT_WIDE';

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
  { dailyFlights, peakHourlyFlights, flightsByTimeOfDay, statistics, flightData },
  date,
) => {
  if (!statistics) {
    console.warn('Статистика отсутствует');
    return { success: false, error: 'Нет данных статистики' };
  }
  console.log({ dailyFlights, peakHourlyFlights, flightsByTimeOfDay, statistics, flightData });
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    addRegionTitleSlide(pptx, regionName, date);
    addStatisticsSlide(pptx, statistics, date);

    // Слайд: Полёты по датам
    const slide1 = pptx.addSlide();
    slide1.background = { color: 'FFFFFF' };
    const data1 = prepareLineChartData(dailyFlights, 'date', 'count', 'Полёты');
    slide1.addChart('line', data1, {
      x: 0.3,
      y: 1.0,
      w: '94%',
      h: 5.5,
      title: 'Количество полетов по датам',
      titleFontSize: 20,
      titleColor: '002B5B',
      chartColors: ['#4A90E2'],
    });

    // Слайд: Пиковая нагрузка
    const slide2 = pptx.addSlide();
    slide2.background = { color: 'FFFFFF' };
    const data2 = prepareLineChartData(peakHourlyFlights, 'date', 'maxFlights', 'Пик');
    slide2.addChart('line', data2, {
      x: 0.3,
      y: 1.0,
      w: '94%',
      h: 5.5,
      title: 'Пиковая нагрузка по дням',
      titleFontSize: 20,
      titleColor: '002B5B',
      chartColors: ['#FF6F61'],
    });

    // Слайд: Суммарная длительность по датам
    const slide3 = pptx.addSlide();
    slide3.background = { color: 'FFFFFF' };

    // Проверяем данные для суммарной длительности
    if (!flightData || !Array.isArray(flightData) || flightData.length === 0) {
      slide3.addText('Нет данных для суммарной длительности', {
        x: 0.5,
        y: 3.0,
        w: 9,
        h: 1.0,
        fontSize: 16,
        color: 'FF0000',
        align: 'center',
      });
    } else {
      // Группируем данные по датам и суммируем длительность
      const groupedData = {};

      flightData.forEach((item) => {
        // Проверяем, что у элемента есть нужные поля
        if (item && item.date && typeof item.durationMinutes === 'number') {
          const dateString = item.date; // '2025-04-27'
          if (!groupedData[dateString]) {
            groupedData[dateString] = 0;
          }
          groupedData[dateString] += item.durationMinutes;
        }
      });

      // Преобразуем в массив для графика
      const processedData = Object.entries(groupedData).map(([date, totalDuration]) => ({
        date: date,
        totalDurationMinutes: totalDuration,
      }));

      // Если есть данные для графика
      if (processedData.length > 0) {
        const data3 = prepareLineChartData(
          processedData,
          'date',
          'totalDurationMinutes',
          'Длительность',
        );
        slide3.addChart('line', data3, {
          x: 0.3,
          y: 1.0,
          w: '94%',
          h: 5.5,
          title: 'Суммарная длительность полетов по датам',
          titleFontSize: 20,
          titleColor: '002B5B',
          chartColors: ['#50C878'],
        });
      } else {
        slide3.addText('Нет валидных данных для графика', {
          x: 0.5,
          y: 3.0,
          w: 9,
          h: 1.0,
          fontSize: 16,
          color: 'FF0000',
          align: 'center',
        });
      }
    }

    // Слайд: По часам суток
    const slide4 = pptx.addSlide();
    slide4.background = { color: 'FFFFFF' };
    const pieData = flightsByTimeOfDay.map((item) => ({ name: item.label, value: item.value }));
    slide4.addChart('pie', pieData, {
      x: 2.0,
      y: 1.5,
      w: 6.0,
      h: 4.5,
      title: 'Распределение полетов по часам суток',
      titleFontSize: 20,
      titleColor: '002B5B',
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
export const exportDurationByDateChart = async (regionName, flightData, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';

    addRegionTitleSlide(pptx, regionName, date);

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Добавляем ЗАГОЛОВОК как отдельный текст (гарантированно виден)
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

    // Проверяем входные данные
    if (!flightData || !Array.isArray(flightData) || flightData.length === 0) {
      console.error('Нет данных для экспорта суммарной длительности');
      // Создаем пустой график с сообщением
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

    // Группируем данные по датам и суммируем длительность
    const groupedData = {};

    flightData.forEach((item) => {
      // Проверяем, что у элемента есть нужные поля
      if (item && item.date && typeof item.durationMinutes === 'number') {
        const dateString = item.date; // '2025-04-27'
        if (!groupedData[dateString]) {
          groupedData[dateString] = 0;
        }
        groupedData[dateString] += item.durationMinutes;
      }
    });

    // Преобразуем в массив для графика
    const processedData = Object.entries(groupedData).map(([date, totalDuration]) => ({
      date: date,
      totalDurationMinutes: totalDuration,
    }));

    // Если нет данных после обработки
    if (processedData.length === 0) {
      console.error('Нет валидных данных для графика');
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

    // Подготавливаем данные для линейного графика
    const chartData = prepareLineChartData(
      processedData,
      'date',
      'totalDurationMinutes',
      'Длительность',
    );

    slide.addChart('line', chartData, {
      x: 0.3,
      y: 1.1, // Слегка выше, чтобы уместить заголовок
      w: '94%',
      h: 5.4,
      // УБРАЛИ встроенный title — он не работает надёжно для line-графиков
      chartColors: ['#50C878'],
      showValue: true,
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
  const { dailyFlights, peakHourlyFlights, flightsByTimeOfDay, statistics, flightData } =
    chartsData;

  switch (type) {
    case 'daily':
      return exportMonthlyChart(dailyFlights, date, regionName);
    case 'peak':
      return exportPeakFlightsChart(regionName, peakHourlyFlights, date);
    case 'timeofday':
      return exportTimeOfDayChart(regionName, flightsByTimeOfDay, date);
    case 'duration-by-date':
      return exportDurationByDateChart(regionName, flightData, date);
    case 'stats':
      return exportStatisticsSlide(regionName, statistics, date);
    case 'all-region':
    default:
      return exportAllRegionCharts(regionName, chartsData, date);
  }
};
