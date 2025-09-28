import { arc, pie, scaleOrdinal, select } from 'd3';

import { memo, useEffect, useRef } from 'react';

import { Arcs } from './Arcs';
import { Legend } from './Legend';
import './PieChart.css';

export const PieChart = memo(({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const containerWidth = containerRef.current?.clientWidth || 600;
    const isMobile = containerWidth < 768;
    const isTablet = containerWidth >= 768 && containerWidth < 1024;

    const margin = {
      top: isMobile ? 40 : 60,
      right: isMobile ? 40 : 250,
      bottom: isMobile ? 10 : 60,
      left: isMobile ? 40 : 60,
    };

    const outerRadius = isMobile ? 100 : isTablet ? 140 : 180;
    const innerRadius = outerRadius * 0.4;

    const width = outerRadius * 2 + margin.left + margin.right + 30;
    let height = outerRadius * 2 + margin.top + margin.bottom;

    let legendHeight = 0;

    if (isMobile) {
      // Динамически рассчитываем высоту легенды
      const legendItemHeight = 40;
      const maxWidth = containerWidth * 0.9;
      let currentX = 0;
      let currentY = 0;
      const lineHeight = legendItemHeight;

      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const textLength = d.label.length * 14 * 0.6 + 18 + 10; // fontSize * 0.6

        if (currentX + textLength > maxWidth) {
          currentX = 0;
          currentY += lineHeight;
        }
        currentX += textLength + 20; // itemSpacing
      }

      legendHeight = currentY + lineHeight + 20; // +20 отступ
      height += legendHeight;
    }

    // Очищаем предыдущий SVG
    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .attr('class', 'pie-chart-svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${outerRadius + margin.top})`);

    // ✅ Рассчитываем общее количество
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);

    // ✅ Добавляем проценты в данные
    const dataWithPercents = data.map((d) => ({
      ...d,
      percent: totalValue ? ((d.value / totalValue) * 100).toFixed(1) : 0,
    }));

    // ✅ Гармоничные цвета под времена суток (в тон палитре)
    const color = scaleOrdinal()
      .domain(dataWithPercents.map((d) => d.label))
      .range([
        '#96B54a', // Утро — мягкий жёлтый (солнце)
        '#64ffda', // День — акцентный бирюзовый
        '#2196F3', // Вечер — синий (закат)
        '#4CAF50', // Ночь — тёмно-зелёный (ночь)
      ]);
    //       .range([
    //   '#c792ea', // Утро — мягкий жёлтый (солнце)
    //   '#2196F3', // День — акцентный бирюзовый
    //   '#96B54a', // Вечер — синий (закат)
    //   '#4B6bc4', // Ночь — тёмно-зелёный (ночь)
    // ]);

    // Построение диаграммы
    const pieGenerator = pie()
      .value((d) => d.value)
      .sort(null);

    const arcGenerator = arc().innerRadius(innerRadius).outerRadius(outerRadius);

    // Рендер дуг
    Arcs(g, dataWithPercents, pieGenerator, arcGenerator, color);

    // Рендер легенды
    if (isMobile) {
      const legendOffsetX = -outerRadius; // Центрируем по оси X
      const legendOffsetY = outerRadius + 30; // Под диаграммой
      Legend(g, dataWithPercents, color, legendOffsetX, legendOffsetY, true, containerWidth);
    } else {
      const legendOffsetX = outerRadius + 20; // Справа от диаграммы
      const legendOffsetY = -outerRadius; // Выравнивание по верху
      Legend(g, dataWithPercents, color, legendOffsetX, legendOffsetY, false);
    }
  }, [data]);

  return (
    <div ref={containerRef} className="pie-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});
