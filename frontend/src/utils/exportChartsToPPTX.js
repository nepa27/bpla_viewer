/* eslint-disable no-unused-vars */
import { aggregateByMonth, prepareXYChartData } from './functions';
import { addVerticalBarChart } from './pptxChartUtils';
import { addHorizontalBarChart } from './pptxChartUtils';

export const exportChartsToPPTX = async (chartsData, fileName = 'flight_statistics.pptx', date) => {
  try {
    const pptxgenjs = await import('pptxgenjs');
    const pptx = new pptxgenjs.default();

    pptx.author = 'Flight Analytics System';
    pptx.company = 'Aviation Insights';
    pptx.layout = 'LAYOUT_WIDE';

    // === Слайд 1: Заглавный ===
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

    // === Слайд 2: Диаграмма ===
    const chartSlide1 = pptx.addSlide();
    chartSlide1.background = { color: 'FFFFFF' };

    const barData = prepareXYChartData(
      chartsData.flightsByRegion,
      'region',
      'count',
      'Полёты по регионам',
      10,
      true,
    );

    addHorizontalBarChart(chartSlide1, barData, {
      title: 'Топ-10 регионов по количеству полётов',
      color: '#4A90E2',
    });

    // === Слайд 3: Диаграмма ===
    const chartSlide2 = pptx.addSlide();
    chartSlide2.background = { color: 'FFFFFF' };

    const barData2 = prepareXYChartData(
      chartsData.flightsDurationByRegion,
      'region',
      'totalDurationMinutes',
      'Полёты по регионам',
      10,
      true,
    );

    addHorizontalBarChart(chartSlide2, barData2, {
      title: 'Топ-10 регионов по суммарной длительности полётов',
      color: '#4A90E2',
    });

    // === Слайд 4: Диаграмма по месяцам ===
    const chartSlide3 = pptx.addSlide();
    chartSlide3.background = { color: 'FFFFFF' };

    // Агрегируем данные по месяцам
    const monthlyFlights = aggregateByMonth(chartsData.dailyFlights);

    const barData3 = prepareXYChartData(
      monthlyFlights,
      'monthLabel',
      'total',
      'Полёты по месяцам',
      Infinity,
    );

    addHorizontalBarChart(chartSlide3, barData3, {
      title: 'Количество полетов по месяцам',
      color: '#4A90E2',
    });

    // === Сохранение ===
    pptx.writeFile({ fileName });
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта в PPTX:', error);
    return { success: false, error: error.message };
  }
};
