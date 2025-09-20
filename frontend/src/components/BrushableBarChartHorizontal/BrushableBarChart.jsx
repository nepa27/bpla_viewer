// BrushableBarChart.jsx
import { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
// Предполагается, что AxisBottom и AxisLeft теперь отвечают за правильную ориентацию
import { AxisBottom } from './AxisBottomHorizontal'; // Новый файл для оси X (внизу)
import { AxisLeft } from './AxisLeftHorizontal';     // Новый файл для оси Y (слева)
import { Marks } from './MarksHorizontal';           // Новый файл для отрисовки горизонтальных столбцов
import './BrushableBarChart.css';

export const BrushableBarChart = memo(({ data, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    // Улучшенная проверка на существование данных
    if (!data || !Array.isArray(data) || data.length === 0 || !svgRef.current) {
      if (svgRef.current) {
         d3.select(svgRef.current).selectAll("*").remove();
      }
      return;
    }

    const margin = { top: 20, right: 30, bottom: 50, left: 100 }; // Увеличен left margin для подписей
    const width = 900 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom; // Может потребоваться увеличить высоту для вертикальных меток

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- ИЗМЕНЕНИЕ 1: Шкалы ---
    // Линейная шкала для оси X (количество)
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([0, width]); // От 0 до ширины

    // Категориальная шкала для оси Y (даты)
    const y = d3.scaleBand()
      .domain(data.map(d => d.date.getTime()))
      .range([0, height]) // От 0 до высоты
      .padding(0.1);

    // --- ИЗМЕНЕНИЕ 2: Сетка ---
    // Горизонтальная сетка (линии от оси X влево до правого края)
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y) // Используем ось Y для создания горизонтальных линий сетки
        .tickSize(-width) // Линии тянутся на всю ширину влево
        .tickFormat("")   // Без подписей
      )
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-opacity", 0.3);

    // Вертикальная сетка (линии от оси X вниз до нижнего края)
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`) // Перемещаем вниз
      .call(d3.axisBottom(x) // Используем ось X для создания вертикальных линий сетки
        .tickSize(-height)   // Линии тянутся вверх на всю высоту
        .tickFormat("")      // Без подписей
      )
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-opacity", 0.3);

    // --- ИЗМЕНЕНИЕ 3: Оси ---
    // Ось X (внизу)
    AxisBottom(g, x, height, width); // height нужен для позиционирования
    // Ось Y (слева)
    AxisLeft(g, y, width); // width может понадобиться для стилизации

    // --- ИЗМЕНЕНИЕ 4: Подписи осей ---
    // Подпись оси X
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text("Количество полетов");

    // Подпись оси Y (поворот на 90 градусов)
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text("Дата");

    // --- ИЗМЕНЕНИЕ 5: Столбцы ---
    Marks(g, data, x, y, width); // Передаем width, хотя он может не понадобиться

    // --- ИЗМЕНЕНИЕ 6: Brush ---
    // Используем brushY для вертикальной кисти
    const brush = d3.brushY()
      .extent([[0, 0], [width, height]]) // Область кисти
      .on("brush end", brushed);

    const brushGroup = g.append("g")
      .attr("class", "brush")
      .call(brush);

    function brushed(event) {
      if (!event.selection) {
        onBrush && onBrush(null);
        return;
      }

      const [y0, y1] = event.selection; // y0, y1 для вертикальной кисти
      const dates = data.map(d => d.date.getTime());

      // Пересчитываем индексы на основе высоты и выбора по оси Y
      const startIndex = Math.floor((y0 / height) * dates.length);
      const endIndex = Math.ceil((y1 / height) * dates.length);

      // Убедимся, что индексы в пределах массива
      const startDateIndex = Math.max(0, Math.min(dates.length - 1, startIndex));
      const endDateIndex = Math.max(0, Math.min(dates.length - 1, endIndex));

      // Получаем даты по индексам. Так как Y шкала идет сверху вниз,
      // y0 соответствует более ранней дате (startIndex), y1 - более поздней (endIndex)
      const startDate = new Date(dates[startDateIndex]);
      const endDate = new Date(dates[endDateIndex]);

      onBrush && onBrush([new Date(startDate), new Date(endDate)]);
    }

  }, [data, onBrush]);

  return (
    <div ref={containerRef} style={{ width: '100%', overflowX: 'auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
});