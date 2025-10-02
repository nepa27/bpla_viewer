import { aggregateByMonth, prepareXYChartData } from './functions';
import { addHorizontalBarChart } from './pptxChartUtils';

const PPTX_CONFIG = {
  LAYOUT: 'LAYOUT_WIDE',
  AUTHOR: 'NepSeudoCode',
  COMPANY: 'NepSeudoCode',
};

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

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

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

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

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
export const exportMonthlyChart = async (dailyFlights, date) => {
  try {
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

    addTitleSlide(pptx, date);

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
      fileName: 'flight_statistics_monthly.pptx',
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

    pptx.author = PPTX_CONFIG.AUTHOR;
    pptx.company = PPTX_CONFIG.COMPANY;
    pptx.layout = PPTX_CONFIG.LAYOUT;

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
      return exportMonthlyChart(chartsData.dailyFlights, date);
    case 'all':
    default:
      return exportChartsToPPTX(chartsData, 'flight_statistics_all.pptx', date);
  }
};
