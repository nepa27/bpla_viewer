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
import { PeakHourlyFlightsAxisBottom } from './PeakHourlyFlightsAxisBottom';
import { PeakHourlyFlightsAxisLeft } from './PeakHourlyFlightsAxisLeft';
import './PeakHourlyFlightsChart.css';
import { PeakHourlyFlightsMarks } from './PeakHourlyFlightsMarks';

timeFormatDefaultLocale(timeFormatDefaultRussia);

export const PeakHourlyFlightsChart = memo(({ peakHourlyFlightsData, onBrush = () => {} }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!peakHourlyFlightsData?.length || !svgRef.current) {
      console.log('Early return: no data or no svg ref');
      return;
    }

    //   Используем requestAnimationFrame для гарантии, что DOM обновился
    const drawChart = () => {
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

      // Подготовка данных: преобразуем date в Date
      const chartData = peakHourlyFlightsData
        .map((item) => {
          //   Корректное преобразование дат
          const date = new Date(item.date);
          const peakHour = new Date(item.peakHour);

          // Проверяем валидность дат
          if (isNaN(date.getTime()) || isNaN(peakHour.getTime())) {
            console.warn('Invalid date found:', item);
            return null;
          }

          return {
            ...item,
            date,
            peakHour,
          };
        })
        .filter(Boolean) // Убираем null значения
        .sort((a, b) => a.date - b.date);

      if (chartData.length === 0) {
        console.warn('No valid data to display');
        return;
      }

      // Шкалы
      const x = scaleTime()
        .domain(extent(chartData, (d) => d.date))
        .range([0, width]);

      const y = scaleLinear()
        .domain([0, max(chartData, (d) => d.maxFlights)])
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
        .text('Максимальное количество полётов за час');

      g.append('text')
        .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .attr('class', 'axis-label')
        .text('Дата');

      // Рендер точек и линии
      PeakHourlyFlightsMarks(g, chartData, x, y, height, width, isMobile);
    };

    //   Используем requestAnimationFrame для гарантии, что DOM обновился
    const frameId = requestAnimationFrame(drawChart);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [peakHourlyFlightsData]);

  return (
    <div ref={containerRef} className="peak-hourly-flights-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});
