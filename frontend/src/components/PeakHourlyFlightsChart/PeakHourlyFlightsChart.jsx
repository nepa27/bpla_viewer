import {
  axisBottom,
  axisLeft,
  brushX,
  extent,
  line,
  max,
  scaleLinear,
  scaleTime,
  select,
  symbol,
  symbolCircle,
  timeFormat,
  timeFormatDefaultLocale,
} from 'd3';

import { memo, useEffect, useRef } from 'react';

import { PeakHourlyFlightsAxisBottom } from './PeakHourlyFlightsAxisBottom';
import { PeakHourlyFlightsAxisLeft } from './PeakHourlyFlightsAxisLeft';
import './PeakHourlyFlightsChart.css';
import { PeakHourlyFlightsMarks } from './PeakHourlyFlightsMarks';

// Локализация
timeFormatDefaultLocale({
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  shortDays: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  months: [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ],
  shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
});

export const PeakHourlyFlightsChart = memo(({ flightData, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!flightData?.length || !svgRef.current) return;

    // Адаптивные размеры
    const containerWidth = containerRef.current?.clientWidth || 900;
    const isMobile = containerWidth < 768;
    const isTablet = containerWidth >= 768 && containerWidth < 1024;

    const margin = {
      top: isMobile ? 20 : 30,
      right: isMobile ? 20 : 40,
      bottom: isMobile ? 60 : 70,
      left: isMobile ? 60 : 80,
    };

    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = isMobile ? 250 : isTablet ? 300 : 350;

    // Очищаем предыдущий SVG
    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .attr('class', 'peak-hourly-flights-chart-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Подготовка данных: группировка по часу и подсчёт полётов
    const flightsByHour = new Map();

    for (const flight of flightData) {
      const flightDate = new Date(flight.date);
      const hourKey = new Date(
        flightDate.getFullYear(),
        flightDate.getMonth(),
        flightDate.getDate(),
        flightDate.getHours(),
      ).toISOString();

      if (!flightsByHour.has(hourKey)) {
        flightsByHour.set(hourKey, { date: new Date(hourKey), count: 0 });
      }
      flightsByHour.get(hourKey).count += 1;
    }

    const chartData = Array.from(flightsByHour.values()).sort((a, b) => a.date - b.date);

    if (chartData.length === 0) return;

    // Шкалы
    const x = scaleTime()
      .domain(extent(chartData, (d) => d.date))
      .range([0, width]);

    const y = scaleLinear()
      .domain([0, max(chartData, (d) => d.count)])
      .nice()
      .range([height, 0]);

    // Добавляем сетку
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickSize(-height).tickFormat(''));

    g.append('g').attr('class', 'grid').call(axisLeft(y).tickSize(-width).tickFormat(''));

    // Ось X
    PeakHourlyFlightsAxisBottom(g, x, height, width);

    // Ось Y
    PeakHourlyFlightsAxisLeft(g, y);

    // Подписи осей
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('class', 'axis-label')
      .text('Количество полётов за час');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .attr('class', 'axis-label')
      .text('Дата и час');

    // Рендер точек и линии
    PeakHourlyFlightsMarks(g, chartData, x, y, height, width, isMobile);

    // Brush
    const brush = brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('brush end', brushed);

    const brushGroup = g.append('g').attr('class', 'brush').call(brush);

    function brushed(event) {
      if (!event.selection) {
        onBrush?.(null);
        return;
      }

      const [x0, x1] = event.selection;
      const dates = chartData.map((d) => d.date.getTime());

      const startIndex = Math.floor((x0 / width) * dates.length);
      const endIndex = Math.ceil((x1 / width) * dates.length);

      const startDate = new Date(dates[Math.max(0, startIndex)]);
      const endDate = new Date(dates[Math.min(dates.length - 1, endIndex)]);

      onBrush?.([startDate, endDate]);
    }

    return () => {
      brushGroup.on('brush end', null);
    };
  }, [flightData, onBrush]);

  return (
    <div ref={containerRef} className="peak-hourly-flights-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});
