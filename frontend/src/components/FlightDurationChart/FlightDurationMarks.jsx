import { line, select, symbol, symbolCircle, timeFormat } from 'd3';

export const FlightDurationMarks = (g, data, x, y, height, width, isMobile) => {
  // Линия
  const lineGenerator = line()
    .x((d) => x(d.date))
    .y((d) => y(d.value));

  g.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', '#4CAF50')
    .attr('stroke-width', 2)
    .attr('d', lineGenerator);

  // Точки
  const pointSymbol = symbol()
    .type(symbolCircle)
    .size(isMobile ? 10 : 20);

  const dots = g
    .selectAll('.dot')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'dot-group')
    .attr('transform', (d) => `translate(${x(d.date)},${y(d.value)})`);

  dots
    .append('path')
    .attr('d', pointSymbol)
    .attr('fill', '#64ffda')
    .attr('stroke', '#4CAF50')
    .attr('stroke-width', 1.5)
    .on('mouseover', function (event, d) {
      select(this).attr('fill', '#ff6b6b');

      // ✅ Создаём тултип внутри SVG
      const tooltip = select(this.parentNode)
        .append('g')
        .attr('class', 'tooltip-group')
        .attr('transform', `translate(10, -10)`); // Смещение относительно точки

      tooltip
        .append('rect')
        .attr('fill', 'black')
        .attr('fill-opacity', 0.8)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('x', 0)
        .attr('y', -20)
        .attr('width', 140)
        .attr('height', 24);

      tooltip
        .append('text')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('x', 6)
        .attr('y', -3)
        .text(`${timeFormat('%d.%m.%Y')(d.date)}: ${d.value} мин`);

      select(this.parentNode).raise(); // Поднимаем точку
    })
    .on('mouseout', function () {
      select(this).attr('fill', '#64ffda');
      // Удаляем тултип
      select(this.parentNode).select('.tooltip-group').remove();
    });
};
// import { curveNatural, line, select, symbol, symbolCircle, timeFormat } from 'd3';

// export const FlightDurationMarks = (g, data, x, y, height, width, isMobile) => {
//   const lineGenerator = line()
//     .x((d) => x(d.date))
//     .y((d) => y(d.value))
//     .curve(curveNatural);

//   g.append('path')
//     .datum(data)
//     .attr('class', 'line')
//     .attr('fill', 'none')
//     .attr('stroke', '#4CAF50')
//     .attr('stroke-width', 2)
//     .attr('d', lineGenerator)
//     .attr('stroke-linejoin', 'round');
// };
