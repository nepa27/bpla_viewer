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

export const FlightDurationChart = memo(({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

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

    // Шкалы
    const x = scaleTime()
      .domain(extent(data, (d) => d.date))
      .range([0, width]);

    const y = scaleLinear()
      .domain([0, max(data, (d) => d.value)])
      .nice()
      .range([height, 0]);

    // Сетка
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickSize(-height).tickFormat(''));

    g.append('g').attr('class', 'grid').call(axisLeft(y).tickSize(-width).tickFormat(''));

    // Оси
    FlightDurationAxisBottom(g, x, height, width);
    FlightDurationAxisLeft(g, y);

    // Подписи
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

    FlightDurationMarks(g, data, x, y, height, width, isMobile);
  }, [data]);

  return (
    <div ref={containerRef} className="flight-duration-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});
