import * as d3 from 'd3';

import { useCallback, useEffect, useRef } from 'react';

import { formatAxisHours, formatDuration } from '../utils/functions';

const useD3BarChart = (
  svgRef,
  containerRef,
  processedData,
  onBrush,
  chartType = 'flights', // 'flights' или 'duration'
  isMobile,
) => {
  const brushRef = useRef(null);
  const dataRef = useRef(processedData);

  useEffect(() => {
    dataRef.current = processedData;
  }, [processedData]);

  const renderChart = useCallback(() => {
    const svgElement = svgRef.current;
    const containerElement = containerRef.current;
    if (!svgElement || !containerElement || processedData.length === 0) {
      if (svgElement) {
        d3.select(svgElement).selectAll('*').remove();
      }
      return;
    }

    const containerWidth = containerElement.clientWidth || 900;
    const margin = {
      top: isMobile ? 20 : 30,
      right: isMobile ? 20 : 30,
      bottom: isMobile ? 80 : 100,
      left: isMobile ? 120 : 150,
    };

    const chartHeight = Math.max(300, processedData.length * (isMobile ? 30 : 35));
    const width = Math.max(300, Math.min(containerWidth - margin.left - margin.right, 1200));
    const height = chartHeight - margin.top - margin.bottom;

    d3.select(svgElement).selectAll('*').remove();

    const svg = d3
      .select(svgElement)
      .attr('class', `region-${chartType}-chart-svg`)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // --- Шкалы ---
    const maxValue = d3.max(processedData, (d) => d.totalDurationMinutes || d.count);
    const x = d3.scaleLinear().domain([0, maxValue]).nice().range([0, width]);
    const y = d3
      .scaleBand()
      .domain(processedData.map((d) => d.region))
      .range([0, height])
      .padding(0.1);

    // --- Сетка ---
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.3);

    // --- Ось X ---
    const xAxisFormat = chartType === 'duration' ? formatAxisHours : null;
    const xAxisLabel =
      chartType === 'duration' ? 'Суммарная длительность полетов (часы)' : 'Количество полетов';

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickFormat(xAxisFormat || null)
          .ticks(isMobile ? 5 : 8),
      )
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', isMobile ? '8px' : '10px');

    // --- Ось Y ---
    const yAxis = g
      .append('g')
      .attr('class', 'y-axis')
      .call(
        d3
          .axisLeft(y)
          .tickSize(0)
          .tickFormat((d) => {
            const maxLength = isMobile ? 15 : 25;
            return d.length > maxLength ? d.substring(0, maxLength - 3) + '...' : d;
          }),
      );

    yAxis
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', isMobile ? '8px' : '10px')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.35em')
      .attr('transform', 'rotate(-20)');

    g.selectAll('.x-axis line, .x-axis path, .y-axis line, .y-axis path').attr('stroke', '#555');

    // --- Подписи осей ---
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text('Регион');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(xAxisLabel);

    // --- Столбцы ---
    g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.region))
      .attr('width', (d) => x(chartType === 'duration' ? d.totalDurationMinutes : d.count))
      .attr('height', y.bandwidth())
      .attr('fill', chartType === 'duration' ? '#2196F3' : '#4CAF50')
      .on('mouseover', function () {
        d3.select(this).attr('fill', chartType === 'duration' ? '#1976D2' : '#45a049');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', chartType === 'duration' ? '#2196F3' : '#4CAF50');
      });

    // --- Подписи значений ---
    if (!isMobile && processedData.length <= 50) {
      g.selectAll('.bar-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => x(chartType === 'duration' ? d.totalDurationMinutes : d.count) + 5)
        .attr('y', (d) => y(d.region) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '10px')
        .text((d) => (chartType === 'duration' ? formatDuration(d.totalDurationMinutes) : d.count));
    }

    // --- Brush ---
    if (onBrush) {
      const brush = d3
        .brushY()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on('start brush end', brushed);

      const brushGroup = g.append('g').attr('class', 'brush').call(brush);
      brushRef.current = brushGroup;
    }

    function brushed(event) {
      if (!event.selection) {
        onBrush(null);
        return;
      }

      const [y0, y1] = event.selection;
      const currentData = dataRef.current;

      const selectedRegions = currentData
        .filter((region) => {
          const yPos = y(region.region) + y.bandwidth() / 2;
          return yPos >= y0 && yPos <= y1;
        })
        .map((region) => region.region);

      onBrush(selectedRegions.length > 0 ? selectedRegions : null);
    }
    // @TODO
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedData, onBrush, chartType, isMobile]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  useEffect(() => {
    return () => {
      if (brushRef.current) {
        brushRef.current.on('.brush', null);
      }
    };
  }, [onBrush]);
};

export default useD3BarChart;
