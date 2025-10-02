import {
  axisBottom,
  axisLeft,
  extent,
  max,
  scaleLinear,
  scaleTime,
  select,
  timeFormatDefaultLocale,
} from 'd3';

import { memo, useEffect, useRef } from 'react';

import { timeFormatDefaultRussia } from '../../utils/constant';
import { FlightDurationAxisBottom } from './FlightDurationAxisBottom';
import { FlightDurationAxisLeft } from './FlightDurationAxisLeft';
import './FlightDurationChart.css';
import { FlightDurationMarks } from './FlightDurationMarks';

timeFormatDefaultLocale(timeFormatDefaultRussia);

export const FlightDurationChart = memo(({ flightData, dateRange }) => {
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

    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .attr('class', 'flight-duration-chart-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Группировка по дате и суммирование длительности
    const aggregatedData = new Map();

    for (const flight of flightData) {
      const dateStr = flight.date;
      const duration = flight.durationMinutes || 0;
      const date = new Date(dateStr);

      if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
          const startCompareDate = new Date(startDate);
          const endCompareDate = new Date(endDate);

          startCompareDate.setHours(0, 0, 0, 0);
          endCompareDate.setHours(23, 59, 59, 999);

          if (date < startCompareDate || date > endCompareDate) continue;
        }
      }

      if (!aggregatedData.has(dateStr)) {
        aggregatedData.set(dateStr, { date, totalDuration: 0 });
      }

      aggregatedData.get(dateStr).totalDuration += duration;
    }

    const chartData = Array.from(aggregatedData.values())
      .map((d) => ({
        date: d.date,
        value: d.totalDuration,
      }))
      .sort((a, b) => a.date - b.date);

    if (chartData.length === 0) return;

    // Шкалы
    const x = scaleTime()
      .domain(extent(chartData, (d) => d.date))
      .range([0, width]);

    const y = scaleLinear()
      .domain([0, max(chartData, (d) => d.value)])
      .nice()
      .range([height, 0]);

    // Сетка
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickSize(-height).tickFormat(''));

    g.append('g').attr('class', 'grid').call(axisLeft(y).tickSize(-width).tickFormat(''));

    // Ось X
    FlightDurationAxisBottom(g, x, height, width);

    // Ось Y
    FlightDurationAxisLeft(g, y);

    // Подписи осей
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('class', 'axis-label')
      .text('Суммарная длительность (мин)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .attr('class', 'axis-label')
      .text('Дата');

    // Рендер точек и линии
    FlightDurationMarks(g, chartData, x, y, height, width, isMobile);
  }, [flightData, dateRange]);

  return (
    <div ref={containerRef} className="flight-duration-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});
