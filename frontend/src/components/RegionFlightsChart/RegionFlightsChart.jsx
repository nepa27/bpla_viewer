// Рабочий код
// components/RegionFlightsChart/RegionFlightsChart.jsx
import * as d3 from 'd3';

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { SORT_OPTIONS_KEY } from '../../utils/constant';
import ChartSortSelect from '../ChartSortSelect';
// Импортируем новый компонент
import './RegionFlightsChart.css';

// Опции теперь импортируются из общего компонента
// const SORT_OPTIONS = [ ... ]; // Убираем дублирование

export const RegionFlightsChart = memo(({ data, onBrush = null }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  // Состояние для выбранной опции сортировки/фильтрации
  const [selectedOption, setSelectedOption] = useState(SORT_OPTIONS_KEY.desc); //@TODO СДЕЛАТЬ на SORT_OPTIONS_KEY.all

  // Состояние для высоты контейнера SVG (для скролла при 'all')
  const [svgContainerHeight, setSvgContainerHeight] = useState('auto');

  // Обработчик изменения опции - теперь просто обновляет состояние
  // const handleSelectChange = (event) => { // Убираем старую функцию
  //   setSelectedOption(event.target.value);
  // };
  const handleSelectChange = (newValue) => {
    setSelectedOption(newValue);
  };

  const hadlePagination = () => {};

  // useMemo для вычисления отфильтрованных и отсортированных данных
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let sortedData = data.slice(); // [...data];


    switch (selectedOption) {
      case SORT_OPTIONS_KEY.desc:
        return sortedData.sort((a, b) => b.count - a.count).slice(0, 10);
      case SORT_OPTIONS_KEY.asc:
        return sortedData.sort((a, b) => a.count - b.count).slice(0, 10);
      case SORT_OPTIONS_KEY.all:
      // return sortedData.sort((a, b) => b.count - a.count).slice(0, 10);
      default:
        return sortedData.sort((a, b) => b.count - a.count);
    }
  }, [data, selectedOption]);

  // useEffect для обновления высоты контейнера SVG при изменении processedData и selectedOption
  useEffect(() => {
    if (selectedOption === 'all' && processedData.length > 0) {
      // Предположим, высота одного элемента (столбца) примерно 35px (как в исходном коде)
      // И у нас есть отступы (margin), скажем, 10px от select и 20px снизу для подписей
      const itemHeight = 35;
      const minChartHeight = 300; // Минимальная высота как в исходном коде
      const calculatedHeight = Math.max(minChartHeight, processedData.length * itemHeight);
      // Добавим немного места для подписей осей и внутренних отступов
      // Плюс высота select и отступы
      const totalHeight = calculatedHeight + 100; // Примерное значение, можно подточнить
      setSvgContainerHeight(`${Math.min(totalHeight, 800)}px`); // Ограничиваем максимальную высоту, например, 800px
    } else {
      // Для других опций оставляем auto или устанавливаем фиксированную высоту для Топ-10
      // Установим фиксированную высоту для Топ-10, чтобы контейнер не прыгал
      setSvgContainerHeight('400px'); // Примерная высота для 10 элементов + отступы
    }
  }, [processedData, selectedOption]);

  useEffect(() => {
    if (!processedData || processedData.length === 0 || !svgRef.current) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    // Адаптивные размеры
    const containerWidth = containerRef.current?.clientWidth || 900;
    const isMobile = containerWidth < 768;

    const margin = {
      top: isMobile ? 20 : 30,
      right: isMobile ? 20 : 30,
      bottom: isMobile ? 80 : 100,
      left: isMobile ? 120 : 150,
    };

    // Высота зависит от количества регионов в processedData
    const chartHeight = Math.max(300, processedData.length * (isMobile ? 30 : 35));
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = chartHeight - margin.top - margin.bottom;

    // Очищаем предыдущий SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('class', 'region-flights-chart-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    // const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Шкалы
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.count)])
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
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', isMobile ? '8px' : '10px');

    // Ось Y (слева)
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
      .text('Количество полетов');

    const chart = g.append('g').attr('class', 'chart-svg-container');

    // Рендерим столбцы
    const bars = chart //g
      .selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.region))
      .attr('width', (d) => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', '#4CAF50')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#45a049');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#4CAF50');
      });

    if (selectedOption === SORT_OPTIONS_KEY.all) {
      // const Button = svg
      //   .append('g')
      //   .attr('class', 'list-item-add')
      //   .attr('transform', `translate(20, 60)`)
      //   .style('cursor', 'pointer')
      //   .on('click', () => {
      //     console.log('click');
      //   });
      // Button.append('rect')
      //   .attr('height', 30)
      //   .attr('width', 150)
      //   .attr('rx', 5)
      //   .attr('opacity', 0.3)
      //   .attr('stroke', '#4CAF50')
      //   .attr('stroke-width', 1);
      // Button.append('text')
      //   .attr('x', 75)
      //   .attr('y', 15)
      //   .attr('text-anchor', 'middle')
      //   .attr('dy', '0.3em')
      //   .attr('fill', '#4CAF50')
      //   .attr('font-size', '12px')
      //   .text('Еще регионы...');
    }

    // Добавляем значения над столбцами
    if (!isMobile && processedData.length <= 50) {
      g.selectAll('.bar-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => x(d.count) + 5)
        .attr('y', (d) => y(d.region) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '10px')
        .text((d) => d.count);
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
  }, [processedData, onBrush]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div ref={containerRef} className="region-flights-chart-container">
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
    <div ref={containerRef} className="region-flights-chart-container">
      {/* Используем общий компонент сортировки */}
      <ChartSortSelect
        selectedOption={selectedOption}
        onChange={handleSelectChange}
        label="Показать полеты:" // Можно передать кастомную подпись
      />
      {/* Контейнер для SVG с возможностью скролла */}
      <div
        style={{
          height: svgContainerHeight,
          overflowY: selectedOption === SORT_OPTIONS_KEY.all ? 'auto' : 'hidden', // Включаем скролл только для 'all'
          overflowX: 'hidden', // Скролл по X убран, диаграмма растягивается
        }}
        className="chart-svg-container" // Добавляем класс для стилизации скролла
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
});

/*
// components/RegionFlightsChart/RegionFlightsChart.jsx
import * as d3 from 'd3';

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { SORT_OPTIONS_KEY } from '../../utils/constant';
import ChartSortSelect from '../ChartSortSelect';
import './RegionFlightsChart.css';

export const RegionFlightsChart = memo(({ data, onBrush = null }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [selectedOption, setSelectedOption] = useState(SORT_OPTIONS_KEY.all);

  const handleSelectChange = (newValue) => {
    setSelectedOption(newValue);
  };

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let sortedData = [...data];

    switch (selectedOption) {
      case SORT_OPTIONS_KEY.desc:
        return sortedData.sort((a, b) => b.count - a.count).slice(0, 10);
      case SORT_OPTIONS_KEY.asc:
        return sortedData.sort((a, b) => a.count - b.count).slice(0, 10);
      case SORT_OPTIONS_KEY.all:
        return sortedData.sort((a, b) => b.count - a.count);
      default:
        return sortedData.sort((a, b) => b.count - a.count);
    }
  }, [data, selectedOption]);

  useEffect(() => {
    if (!processedData || processedData.length === 0 || !svgRef.current) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    // Адаптивные размеры
    const containerWidth = containerRef.current?.clientWidth || 900;
    const isMobile = containerWidth < 768;

    const margin = {
      top: isMobile ? 20 : 30,
      right: isMobile ? 20 : 30,
      bottom: isMobile ? 80 : 100,
      left: isMobile ? 120 : 150,
    };

    // Фиксированная высота под 10 элементов
    const itemHeight = isMobile ? 30 : 35;
    const visibleItems = 10;
    const chartHeight = Math.max(300, visibleItems * itemHeight);
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const height = chartHeight - margin.top - margin.bottom;

    // Очищаем предыдущий SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('class', 'region-flights-chart-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Шкалы
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.count)])
      .nice()
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(processedData.map((d) => d.region))
      .range([0, chartHeight]) // Используем полную высоту для размещения всех элементов
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
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', isMobile ? '8px' : '10px');

    // Ось Y (слева) - для видимой области
    const visibleY = d3
      .scaleBand()
      .domain(processedData.slice(0, visibleItems).map((d) => d.region))
      .range([0, height])
      .padding(0.1);

    const yAxis = g
      .append('g')
      .attr('class', 'y-axis')
      .call(
        d3
          .axisLeft(visibleY)
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
      .text('Количество полетов');

    // Создаем прокручиваемый контейнер внутри SVG с помощью foreignObject
    const foreignObject = g
      .append('foreignObject')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-scroll-container');

    const div = foreignObject
      .append('xhtml:div')
      .style('width', '100%')
      .style('height', '100%')
      .style('overflow-y', selectedOption === SORT_OPTIONS_KEY.all ? 'auto' : 'hidden')
      .style('overflow-x', 'hidden');

    // Создаем SVG внутри прокручиваемого контейнера
    const innerSvg = div
      .append('svg')
      .attr('width', width)
      .attr('height', processedData.length * y.bandwidth());

    const chart = innerSvg.append('g').attr('class', 'chart-svg-container');

    // Рендерим столбцы
    const bars = chart
      .selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.region))
      .attr('width', (d) => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', '#4CAF50')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#45a049');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#4CAF50');
      });

    // Добавляем значения над столбцами
    if (!isMobile && processedData.length <= 50) {
      chart
        .selectAll('.bar-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => x(d.count) + 5)
        .attr('y', (d) => y(d.region) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '10px')
        .text((d) => d.count);
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
  }, [processedData, onBrush]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div ref={containerRef} className="region-flights-chart-container">
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
    <div ref={containerRef} className="region-flights-chart-container">
      <ChartSortSelect
        selectedOption={selectedOption}
        onChange={handleSelectChange}
        label="Показать полеты:"
      />
      <svg ref={svgRef}></svg>
    </div>
  );
});


*/
