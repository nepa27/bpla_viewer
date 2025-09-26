// components/RegionDurationChart/RegionDurationChart.jsx
import * as d3 from 'd3';

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { SORT_OPTIONS_KEY } from '../../utils/constant';
// Добавляем useState и useRef
import ChartSortSelect from '../ChartSortSelect';
// Импортируем общий компонент
import './RegionDurationChart.css';

// Хелпер для форматирования длительности в человекочитаемый формат
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)} мин`;
  } else if (minutes < 1440) {
    // меньше суток
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours} ч ${mins} мин`;
  } else {
    // больше или равно суткам
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return `${days} д ${hours} ч`;
  }
};

// Новый хелпер для форматирования оси X в часах
const formatAxisHours = (minutes) => {
  const hours = Math.round(minutes / 60);
  return `${hours} ч`;
};

export const RegionDurationChart = memo(({ data, onBrush }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  // Состояние для выбранной опции сортировки/фильтрации
  const [selectedOption, setSelectedOption] = useState(SORT_OPTIONS_KEY.desc);

  // Состояние для высоты контейнера SVG (для скролла при 'all')
  const [svgContainerHeight, setSvgContainerHeight] = useState('auto');

  // Обработчик изменения опции - теперь просто обновляет состояние
  const handleSelectChange = (newValue) => {
    setSelectedOption(newValue);
  };

  // useMemo для вычисления отфильтрованных и отсортированных данных
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let sortedData = [...data]; // Создаем копию, чтобы не мутировать исходные данные

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

  // useEffect для обновления высоты контейнера SVG при изменении processedData и selectedOption
  useEffect(() => {
    if (selectedOption === SORT_OPTIONS_KEY.all && processedData.length > 0) {
      const itemHeight = 35; // Высота элемента
      const minChartHeight = 300;
      const calculatedHeight = Math.max(minChartHeight, processedData.length * itemHeight);
      const totalHeight = calculatedHeight + 100; // Отступы
      setSvgContainerHeight(`${Math.min(totalHeight, 800)}px`); // Ограничение высоты
    } else {
      // Установим фиксированную высоту для Топ-10, чтобы контейнер не прыгал
      setSvgContainerHeight('400px');
    }
  }, [processedData, selectedOption]);

  // Адаптивные размеры (теперь зависят от высоты контейнера)
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

    // Высота зависит от количества регионов в processedData (для рендеринга)
    const chartHeight = Math.max(300, processedData.length * (isMobile ? 30 : 35));
    const width = Math.max(300, Math.min(containerWidth - margin.left - margin.right, 1200));
    const height = chartHeight - margin.top - margin.bottom;

    // Очищаем предыдущий SVG
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

    // Ось X (внизу) - длительность в часах
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickFormat((d) => {
            // Форматируем длительность в часы для оси
            return formatAxisHours(d);
          })
          .ticks(isMobile ? 5 : 8), // Ограничиваем количество тиков на мобильных
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
      .attr('fill', '#2196F3') // Синий цвет для отличия
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
        .text((d) => formatDuration(d.totalDurationMinutes)); // Форматируем длительность
    }

    if (onBrush) {
      // Brush по оси Y
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
  }, [processedData, onBrush, margin, isMobile]); // Зависимость теперь от processedData

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
      {/* Используем общий компонент сортировки */}
      <ChartSortSelect
        selectedOption={selectedOption}
        onChange={handleSelectChange}
        label="Показать длительность:" // Кастомная подпись для этой диаграммы
      />
      {/* Контейнер для SVG с возможностью скролла */}
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
// // components/RegionDurationChart/RegionDurationChart.jsx
// import * as d3 from 'd3';

// import { memo, useEffect, useMemo, useRef } from 'react';

// import './RegionDurationChart.css';

// // Хелпер для форматирования длительности в человекочитаемый формат
// const formatDuration = (minutes) => {
//   if (minutes < 60) {
//     return `${Math.round(minutes)} мин`;
//   } else if (minutes < 1440) {
//     // меньше суток
//     const hours = Math.floor(minutes / 60);
//     const mins = Math.round(minutes % 60);
//     return `${hours} ч ${mins} мин`;
//   } else {
//     // больше или равно суткам
//     const days = Math.floor(minutes / 1440);
//     const hours = Math.floor((minutes % 1440) / 60);
//     return `${days} д ${hours} ч`;
//   }
// };

// // Новый хелпер для форматирования оси X в часах
// const formatAxisHours = (minutes) => {
//   const hours = Math.round(minutes / 60);
//   return `${hours} ч`;
// };

// export const RegionDurationChart = memo(({ data, onBrush }) => {
//   const svgRef = useRef();
//   const containerRef = useRef();

//   // Фильтруем данные - отображаем только регионы с положительной длительностью
//   const filteredData = useMemo(() => {
//     if (!data || !Array.isArray(data)) return [];
//     return data.filter((d) => d.totalDurationMinutes > 0);
//   }, [data]);

//   useEffect(() => {
//     if (filteredData.length === 0 || !svgRef.current) {
//       if (svgRef.current) {
//         d3.select(svgRef.current).selectAll('*').remove();
//       }
//       return;
//     }

//     // Адаптивные размеры
//     const containerWidth = containerRef.current?.clientWidth || 900;
//     const isMobile = containerWidth < 768;

//     const margin = {
//       top: isMobile ? 20 : 30,
//       right: isMobile ? 20 : 30,
//       bottom: isMobile ? 80 : 100,
//       left: isMobile ? 120 : 150,
//     };

//     // Ограничиваем максимальное количество регионов для производительности
//     const displayData = filteredData.slice(0, 100);

//     // Высота зависит от количества регионов
//     const chartHeight = Math.max(300, displayData.length * (isMobile ? 30 : 35));
//     const width = Math.max(300, Math.min(containerWidth - margin.left - margin.right, 1200));
//     const height = chartHeight - margin.top - margin.bottom;

//     // Очищаем предыдущий SVG
//     d3.select(svgRef.current).selectAll('*').remove();

//     const svg = d3
//       .select(svgRef.current)
//       .attr('class', 'region-duration-chart-svg')
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom);

//     const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

//     // Шкалы
//     const x = d3
//       .scaleLinear()
//       .domain([0, d3.max(displayData, (d) => d.totalDurationMinutes)])
//       .nice()
//       .range([0, width]);

//     const y = d3
//       .scaleBand()
//       .domain(displayData.map((d) => d.region))
//       .range([0, height])
//       .padding(0.1);

//     // Добавляем сетку
//     g.append('g')
//       .attr('class', 'grid')
//       .attr('transform', `translate(0,${height})`)
//       .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
//       .selectAll('line')
//       .attr('stroke', '#444')
//       .attr('stroke-opacity', 0.3);

//     // Ось X (внизу) - длительность в часах
//     g.append('g')
//       .attr('class', 'x-axis')
//       .attr('transform', `translate(0,${height})`)
//       .call(
//         d3
//           .axisBottom(x)
//           .tickSize(0)
//           .tickFormat((d) => {
//             // Форматируем длительность в часы для оси
//             return formatAxisHours(d);
//           })
//           .ticks(isMobile ? 5 : 8), // Ограничиваем количество тиков на мобильных
//       )
//       .selectAll('text')
//       .attr('fill', 'white')
//       .style('font-size', isMobile ? '8px' : '10px');

//     // Ось Y (слева) - регионы
//     const yAxis = g
//       .append('g')
//       .attr('class', 'y-axis')
//       .call(
//         d3
//           .axisLeft(y)
//           .tickSize(0)
//           .tickFormat((d) => {
//             // Ограничиваем длину подписи региона
//             const maxLength = isMobile ? 15 : 25;
//             return d.length > maxLength ? d.substring(0, maxLength - 3) + '...' : d;
//           }),
//       );

//     yAxis
//       .selectAll('text')
//       .attr('fill', 'white')
//       .style('font-size', isMobile ? '8px' : '10px')
//       .attr('text-anchor', 'end')
//       .attr('dx', '-0.8em')
//       .attr('dy', '0.35em')
//       .attr('transform', 'rotate(-20)');

//     // Стилизация осей
//     g.selectAll('.x-axis line, .x-axis path, .y-axis line, .y-axis path').attr('stroke', '#555');

//     // Подписи осей
//     g.append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('y', 0 - margin.left + 20)
//       .attr('x', 0 - height / 2)
//       .attr('dy', '1em')
//       .attr('class', 'axis-label')
//       .attr('text-anchor', 'middle')
//       .attr('fill', 'white')
//       .text('Регион');

//     g.append('text')
//       .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
//       .attr('class', 'axis-label')
//       .attr('text-anchor', 'middle')
//       .attr('fill', 'white')
//       .text('Суммарная длительность полетов (часы)');

//     // Рендерим столбцы
//     const bars = g
//       .selectAll('.bar')
//       .data(displayData)
//       .enter()
//       .append('rect')
//       .attr('class', 'bar')
//       .attr('x', 0)
//       .attr('y', (d) => y(d.region))
//       .attr('width', (d) => x(d.totalDurationMinutes))
//       .attr('height', y.bandwidth())
//       .attr('fill', '#2196F3') // Синий цвет для отличия
//       .on('mouseover', function () {
//         d3.select(this).attr('fill', '#1976D2');
//       })
//       .on('mouseout', function () {
//         d3.select(this).attr('fill', '#2196F3');
//       });

//     // Добавляем значения над столбцами
//     if (!isMobile && displayData.length <= 50) {
//       g.selectAll('.bar-label')
//         .data(displayData)
//         .enter()
//         .append('text')
//         .attr('class', 'bar-label')
//         .attr('x', (d) => x(d.totalDurationMinutes) + 5)
//         .attr('y', (d) => y(d.region) + y.bandwidth() / 2)
//         .attr('dy', '0.35em')
//         .attr('fill', 'white')
//         .style('font-size', '10px')
//         .text((d) => formatDuration(d.totalDurationMinutes)); // Форматируем длительность
//     }
//     if (onBrush) {
//       // Brush по оси Y
//       const brush = d3
//         .brushY()
//         .extent([
//           [0, 0],
//           [width, height],
//         ])
//         .on('brush end', brushed);

//       const brushGroup = g.append('g').attr('class', 'brush').call(brush);

//       function brushed(event) {
//         if (!event.selection) {
//           onBrush && onBrush(null);
//           return;
//         }

//         const [y0, y1] = event.selection;
//         const selectedRegions = [];

//         displayData.forEach((region) => {
//           const yPos = y(region.region) + y.bandwidth() / 2;
//           if (yPos >= y0 && yPos <= y1) {
//             selectedRegions.push(region.region);
//           }
//         });

//         if (onBrush) {
//           onBrush(selectedRegions.length > 0 ? selectedRegions : null);
//         }
//       }

//       return () => {
//         brushGroup.on('brush end', null);
//       };
//     }
//   }, [filteredData, onBrush]);

//   if (!data || !Array.isArray(data) || data.length === 0) {
//     return (
//       <div ref={containerRef} className="region-duration-chart-container">
//         <div
//           style={{
//             color: 'white',
//             textAlign: 'center',
//             padding: '20px',
//             fontStyle: 'italic',
//           }}
//         >
//           Нет данных для отображения
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div ref={containerRef} className="region-duration-chart-container">
//       <svg ref={svgRef}></svg>
//     </div>
//   );
// });
