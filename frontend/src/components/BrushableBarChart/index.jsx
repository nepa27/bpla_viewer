import  { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import { Marks } from './Marks';
import './BrushableBarChart.css';

export const BrushableBarChart = memo(({ data, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  
  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Адаптивные размеры
    const containerWidth = containerRef.current?.clientWidth || 900;
    const isMobile = containerWidth < 768;
    const isTablet = containerWidth >= 768 && containerWidth < 1024;
    
    const margin = { 
      top: isMobile ? 15 : 20, 
      right: isMobile ? 20 : 30, 
      bottom: isMobile ? 50 : 60, 
      left: isMobile ? 50 : 60 
    };
    
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = isMobile ? 200 : isTablet ? 220 : 250;

    // Очищаем предыдущий SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("class", "brushable-bar-chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Шкалы
    const x = d3.scaleBand()
      .domain(data.map(d => d.date.getTime()))
      .range([0, width])
      .padding(isMobile ? 0.05 : 0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height, 0]);

    // Добавляем сетку
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      );

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      );

    // Рендерим оси
    AxisBottom(g, x, height, width);
    AxisLeft(g, y, width);

    // Подписи осей
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .text("Количество полетов");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .attr("class", "axis-label")
      .text("Дата");

    // Рендерим столбцы
    Marks(g, data, x, y, height);

    // Brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed);

    const brushGroup = g.append("g")
      .attr("class", "brush")
      .call(brush);

    function brushed(event) {
      if (!event.selection) {
        onBrush && onBrush(null);
        return;
      }

      const [x0, x1] = event.selection;
      const dates = data.map(d => d.date.getTime());
      
      const startIndex = Math.floor((x0 / width) * dates.length);
      const endIndex = Math.ceil((x1 / width) * dates.length);
      
      const startDate = new Date(dates[Math.max(0, startIndex)]);
      const endDate = new Date(dates[Math.min(dates.length - 1, endIndex)]);
      
      onBrush && onBrush([new Date(startDate), new Date(endDate)]);
    }

  }, [data, onBrush]);

  return (
    <div ref={containerRef} className="brushable-bar-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
});


// import  { memo, useEffect, useRef } from 'react';
// import * as d3 from 'd3';
// import { AxisBottom } from './AxisBottom';
// import { AxisLeft } from './AxisLeft';
// import { Marks } from './Marks';
// import './BrushableBarChart.css';

// export const BrushableBarChart = memo(({ data, onBrush }) => {
//   const svgRef = useRef();
//   const containerRef = useRef();
  
//   useEffect(() => {
//     if (!data.length || !svgRef.current) return;

//     const margin = { top: 20, right: 30, bottom: 60, left: 60 };
//     const width = 900 - margin.left - margin.right;
//     const height = 250 - margin.top - margin.bottom;

//     // Очищаем предыдущий SVG
//     d3.select(svgRef.current).selectAll("*").remove();

//     const svg = d3.select(svgRef.current)
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom);

//     const g = svg.append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Шкалы
//     const x = d3.scaleBand()
//       .domain(data.map(d => d.date.getTime()))
//       .range([0, width])
//       .padding(0.1);

//     const y = d3.scaleLinear()
//       .domain([0, d3.max(data, d => d.count)])
//       .nice()
//       .range([height, 0]);

//     // Добавляем сетку
//     g.append("g")
//       .attr("class", "grid")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x)
//         .tickSize(-height)
//         .tickFormat("")
//       )
//       .selectAll("line")
//       .attr("stroke", "#444")
//       .attr("stroke-opacity", 0.3);

//     g.append("g")
//       .attr("class", "grid")
//       .call(d3.axisLeft(y)
//         .tickSize(-width)
//         .tickFormat("")
//       )
//       .selectAll("line")
//       .attr("stroke", "#444")
//       .attr("stroke-opacity", 0.3);

//     // Рендерим оси
//     AxisBottom(g, x, height, width);
//     AxisLeft(g, y, width);

//     // Подписи осей
//     g.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 0 - margin.left + 20)
//       .attr("x", 0 - (height / 2))
//       .attr("dy", "1em")
//       .attr("class", "axis-label")
//       .text("Количество полетов");

//     g.append("text")
//       .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
//       .attr("class", "axis-label")
//       .text("Дата");

//     // Рендерим столбцы
//     Marks(g, data, x, y, height);

//     // Brush
//     const brush = d3.brushX()
//       .extent([[0, 0], [width, height]])
//       .on("brush end", brushed);

//     const brushGroup = g.append("g")
//       .attr("class", "brush")
//       .call(brush);

//     function brushed(event) {
//       if (!event.selection) {
//         // Создаем копию null вместо прямой передачи
//         onBrush && onBrush(null);
//         return;
//       }

//       const [x0, x1] = event.selection;
//       const dates = data.map(d => d.date.getTime());
      
//       const startIndex = Math.floor((x0 / width) * dates.length);
//       const endIndex = Math.ceil((x1 / width) * dates.length);
      
//       const startDate = new Date(dates[Math.max(0, startIndex)]);
//       const endDate = new Date(dates[Math.min(dates.length - 1, endIndex)]);
      
//       // Создаем копию массива дат вместо передачи оригинала
//       onBrush && onBrush([new Date(startDate), new Date(endDate)]);
//     }

//   }, [data, onBrush]);

//   return (
//     <div ref={containerRef} style={{ width: '100%', overflowX: 'auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
//       <svg ref={svgRef}></svg>
//     </div>
//   );
// });