import { axisBottom, axisLeft, brushX, max, scaleBand, scaleLinear, select } from 'd3';

import { memo, useCallback, useEffect, useRef } from 'react';

import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import './BrushableBarChart.css';
import { Marks } from './Marks';

export const BrushableBarChart = memo(({ data, onBrush = () => {} }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const brushRef = useRef();

  // Группируем данные по месяцам
  const monthlyData = useCallback(() => {
    if (!data?.length) return [];

    const groupedData = {};
    data.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = {
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          count: 0,
        };
      }
      groupedData[monthKey].count += item.count;
    });

    return Object.values(groupedData).sort((a, b) => a.date - b.date);
  }, [data]);

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const groupedMonthlyData = monthlyData();

    // Адаптивные размеры
    const containerWidth = containerRef.current?.clientWidth || 900;
    const isMobile = containerWidth < 768;
    const isTablet = containerWidth >= 768 && containerWidth < 1024;
    const margin = {
      top: isMobile ? 15 : 20,
      right: isMobile ? 20 : 30,
      bottom: isMobile ? 50 : 60,
      left: isMobile ? 50 : 60,
    };
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = isMobile ? 200 : isTablet ? 220 : 250;

    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .attr('class', 'brushable-bar-chart-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Шкалы
    const x = scaleBand()
      .domain(groupedMonthlyData.map((d) => d.date.getTime()))
      .range([0, width])
      .padding(isMobile ? 0.1 : 0.2);

    const y = scaleLinear()
      .domain([0, max(groupedMonthlyData, (d) => d.count)])
      .nice()
      .range([height, 0]);

    // Сетка
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickSize(-height).tickFormat(''));

    g.append('g').attr('class', 'grid').call(axisLeft(y).tickSize(-width).tickFormat(''));

    // Оси
    AxisBottom(g, x, height, width, true);
    AxisLeft(g, y, width);

    // Подписи
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 5)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('class', 'axis-label')
      .text('Количество полетов');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .attr('class', 'axis-label')
      .text('Месяц');

    // Столбцы
    Marks(g, groupedMonthlyData, x, y, height);

    // Brush
    const brush = brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('brush end', (event) => {
        if (!event.selection) {
          onBrush?.(null);
          return;
        }
        const [x0, x1] = event.selection;
        const dates = groupedMonthlyData.map((d) => d.date.getTime());
        const startIndex = Math.floor((x0 / width) * dates.length);
        const endIndex = Math.ceil((x1 / width) * dates.length);
        const startDate = new Date(dates[Math.max(0, startIndex)]);
        const endDate = new Date(dates[Math.min(dates.length - 1, endIndex)]);
        const extendedEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
        onBrush?.([startDate, extendedEndDate]);
      });

    brushRef.current = brush;

    const brushGroup = g.append('g').attr('class', 'brush').call(brush);

    return () => {
      brushGroup.on('brush end', null);
    };
  }, [data, onBrush, monthlyData]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div ref={containerRef} className="brushable-bar-chart-container">
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            fontStyle: 'italic',
          }}
        >
          Нет данных для отображения
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="brushable-bar-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});
