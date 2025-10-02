import { axisBottom, axisLeft, brushY, max, scaleBand, scaleLinear, select } from 'd3';

import { memo, useEffect, useRef } from 'react';

import { AxisBottom } from './AxisBottomHorizontal';
import { AxisLeft } from './AxisLeftHorizontal';
import './BrushableBarChart.css';
import { Marks } from './MarksHorizontal';

export const BrushableBarChart = memo(({ data, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0 || !svgRef.current) {
      if (svgRef.current) {
        select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    const margin = { top: 20, right: 30, bottom: 50, left: 100 };
    const width = 900 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = scaleLinear()
      .domain([0, max(data, (d) => d.count)])
      .nice()
      .range([0, width]);

    const y = scaleBand()
      .domain(data.map((d) => d.date.getTime()))
      .range([0, height])
      .padding(0.1);

    // Горизонтальная сетка
    g.append('g')
      .attr('class', 'grid')
      .call(axisLeft(y).tickSize(-width).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.3);

    // Вертикальная сетка
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickSize(-height).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.3);

    AxisBottom(g, x, height);

    AxisLeft(g, y);

    // Подпись оси X
    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text('Количество полетов');

    // Подпись оси Y (поворот на 90 градусов)
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text('Дата');

    Marks(g, data, x, y);

    const brush = brushY()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('brush end', brushed);

    const brushGroup = g.append('g').attr('class', 'brush').call(brush);

    function brushed(event) {
      if (!event.selection) {
        onBrush && onBrush(null);
        return;
      }

      const [y0, y1] = event.selection;
      const dates = data.map((d) => d.date.getTime());

      const startIndex = Math.floor((y0 / height) * dates.length);
      const endIndex = Math.ceil((y1 / height) * dates.length);

      const startDateIndex = Math.max(0, Math.min(dates.length - 1, startIndex));
      const endDateIndex = Math.max(0, Math.min(dates.length - 1, endIndex));

      const startDate = new Date(dates[startDateIndex]);
      const endDate = new Date(dates[endDateIndex]);

      onBrush && onBrush([new Date(startDate), new Date(endDate)]);
    }
    return () => {
      brushGroup.on('brush end', null);
    };
  }, [data, onBrush]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
});
