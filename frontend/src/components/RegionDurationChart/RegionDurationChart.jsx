/* eslint-disable no-unused-vars */
import * as d3 from 'd3';

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { SORT_OPTIONS_KEY } from '../../utils/constant';
import { formatAxisHours, formatDuration } from '../../utils/functions';
import ChartSortSelect from '../ChartSortSelect/ChartSortSelect';
import './RegionDurationChart.css';

export const RegionDurationChart = memo(({ data, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  const [selectedOption, setSelectedOption] = useState(SORT_OPTIONS_KEY.desc);
  const [svgContainerHeight, setSvgContainerHeight] = useState('auto');

  const handleSelectChange = (newValue) => {
    setSelectedOption(newValue);
  };

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let sortedData = data.slice();

    switch (selectedOption) {
      case SORT_OPTIONS_KEY.desc:
        return sortedData
          .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes)
          .slice(0, 10);
      case SORT_OPTIONS_KEY.asc:
        return sortedData
          .sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes)
          .slice(0, 10);
      case SORT_OPTIONS_KEY.all:
      default:
        return sortedData.sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
    }
  }, [data, selectedOption]);

  // useEffect для обновления высоты контейнера SVG
  useEffect(() => {
    if (selectedOption === SORT_OPTIONS_KEY.all && processedData.length > 0) {
      const itemHeight = 35;
      const minChartHeight = 300;
      const calculatedHeight = Math.max(minChartHeight, processedData.length * itemHeight);
      const totalHeight = calculatedHeight + 100;
      setSvgContainerHeight(`${Math.min(totalHeight, 800)}px`);
    } else {
      // Для других опций устанавливаем фиксированную высоту для Топ-10
      setSvgContainerHeight('400px');
    }
  }, [processedData, selectedOption]);

  // Адаптивные размеры
  const containerWidth = containerRef.current?.clientWidth || 900;
  const isMobile = containerWidth < 768;

  const margin = useMemo(
    () => ({
      top: isMobile ? 20 : 30,
      right: isMobile ? 20 : 30,
      bottom: isMobile ? 80 : 100,
      left: isMobile ? 120 : 150,
    }),
    [isMobile],
  );

  useEffect(() => {
    if (processedData.length === 0 || !svgRef.current) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    // Высота зависит от количества регионов в processedData
    const chartHeight = Math.max(300, processedData.length * (isMobile ? 30 : 35));
    const width = Math.max(300, Math.min(containerWidth - margin.left - margin.right, 1200));
    const height = chartHeight - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('class', 'region-duration-chart-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Шкалы
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.totalDurationMinutes)])
      .nice()
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(processedData.map((d) => d.region))
      .range([0, height])
      .padding(0.1);

    // Добавляем сетку
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.3);

    // Ось X (внизу)
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickFormat((d) => {
            return formatAxisHours(d);
          })
          .ticks(isMobile ? 5 : 8),
      )
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', isMobile ? '8px' : '10px');

    // Ось Y (слева) - регионы
    const yAxis = g
      .append('g')
      .attr('class', 'y-axis')
      .call(
        d3
          .axisLeft(y)
          .tickSize(0)
          .tickFormat((d) => {
            // Ограничиваем длину подписи региона
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

    // Стилизация осей
    g.selectAll('.x-axis line, .x-axis path, .y-axis line, .y-axis path').attr('stroke', '#555');

    // Подписи осей
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
      .text('Суммарная длительность полетов (часы)');

    // Рендерим столбцы
    const bars = g
      .selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.region))
      .attr('width', (d) => x(d.totalDurationMinutes))
      .attr('height', y.bandwidth())
      .attr('fill', '#2196F3')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#1976D2');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#2196F3');
      });

    // Добавляем значения над столбцами
    if (!isMobile && processedData.length <= 50) {
      g.selectAll('.bar-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => x(d.totalDurationMinutes) + 5)
        .attr('y', (d) => y(d.region) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '10px')
        .text((d) => formatDuration(d.totalDurationMinutes));
    }

    if (onBrush) {
      const brush = d3
        .brushY()
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
        const selectedRegions = [];

        processedData.forEach((region) => {
          const yPos = y(region.region) + y.bandwidth() / 2;
          if (yPos >= y0 && yPos <= y1) {
            selectedRegions.push(region.region);
          }
        });

        if (onBrush) {
          onBrush(selectedRegions.length > 0 ? selectedRegions : null);
        }
      }

      return () => {
        brushGroup.on('brush end', null);
      };
    }
    // @TODO
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedData, onBrush, margin, isMobile]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div ref={containerRef} className="region-duration-chart-container">
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
    <div ref={containerRef} className="region-duration-chart-container">
      <ChartSortSelect
        selectedOption={selectedOption}
        onChange={handleSelectChange}
        label="Показать длительность:"
      />
      <div
        style={{
          height: svgContainerHeight,
          overflowY: selectedOption === SORT_OPTIONS_KEY.all ? 'auto' : 'hidden',
          overflowX: 'hidden',
        }}
        className="chart-svg-container"
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
});
