// components/RegionDurationChart/RegionDurationChart.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import useD3BarChart from '../../d3/useD3BarChart';
import { SORT_OPTIONS_CHART } from '../../utils/constant';
import ChartSortSelect from '../ChartSortSelect';
// Путь к хуку
import './RegionDurationChart.css';

export const RegionDurationChart = memo(({ data, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [selectedOption, setSelectedOption] = useState('top10');
  const [svgContainerHeight, setSvgContainerHeight] = useState('400px'); // Устанавливаем фиксированную высоту по умолчанию

  const handleSelectChange = (newValue) => {
    setSelectedOption(newValue);
  };

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let sortedData = [...data];

    switch (selectedOption) {
      case SORT_OPTIONS_CHART.top10:
        return sortedData
          .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes)
          .slice(0, 10);
      case SORT_OPTIONS_CHART.desc:
        return sortedData
          .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes)
          .slice(0, 10);
      case SORT_OPTIONS_CHART.asc:
        return sortedData
          .sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes)
          .slice(0, 10);
      case SORT_OPTIONS_CHART.all:
      default:
        return sortedData.sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
    }
  }, [data, selectedOption]);

  // Обновление высоты контейнера
  useEffect(() => {
    if (selectedOption === 'all' && processedData.length > 0) {
      const itemHeight = 35;
      const minChartHeight = 300;
      const calculatedHeight = Math.max(minChartHeight, processedData.length * itemHeight);
      const totalHeight = calculatedHeight + 100;
      setSvgContainerHeight(`${Math.min(totalHeight, 800)}px`);
    } else {
      setSvgContainerHeight('400px');
    }
  }, [processedData, selectedOption]);

  // Адаптивность
  const containerWidth = containerRef.current?.clientWidth || 900;
  const isMobile = containerWidth < 768;

  // Используем кастомный хук
  useD3BarChart(svgRef, containerRef, processedData, onBrush, 'duration', isMobile);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div ref={containerRef} className="region-duration-chart-container">
        <div className="chart-placeholder">Нет данных для отображения</div>
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
        className="chart-svg-container"
        style={{
          height: svgContainerHeight,
          overflowY: selectedOption === 'all' ? 'auto' : 'hidden',
          overflowX: 'hidden',
        }}
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
});
