import { curveMonotoneX, line, select, symbol, symbolCircle, timeFormat } from 'd3';

export const PeakHourlyFlightsMarks = (g, data, x, y, height, width, isMobile) => {
  // Линия (сглаженная)
  const lineGenerator = line()
    .x((d) => x(d.date))
    .y((d) => y(d.maxFlights))
    .curve(curveMonotoneX);

  g.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', '#FF6B6B')
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
    .attr('transform', (d) => `translate(${x(d.date)},${y(d.maxFlights)})`);

  dots
    .append('path')
    .attr('d', pointSymbol)
    .attr('fill', '#FFD93D')
    .attr('stroke', '#FF6B6B')
    .attr('stroke-width', 1.5)
    .on('mouseover', function (event, d) {
      select(this).attr('fill', '#ff6b6b');

      // Форматируем peakHour
      const peakHourFormatted = timeFormat('%d.%m.%Y %H:00')(d.peakHour);

      const tooltip = select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '6px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px')
        .text(`${d.maxFlights} полётов\nПик: ${peakHourFormatted}`);

      select(this.parentNode).raise();
    })
    .on('mouseout', function () {
      select(this).attr('fill', '#FFD93D');
      select('.tooltip').remove();
    });
};

//  console.log(data)
// [
//   {
//       "date": "2025-01-01T00:00:00.000Z",
//       "maxFlights": 0,
//       "peakHour": "1970-01-01T00:00:00.000Z"
//   },
//   {
//       "date": "2025-01-17T00:00:00.000Z",
//       "maxFlights": 1,
//       "peakHour": "2025-01-17T00:00:00.000Z"
//   },
//   {
//       "date": "2025-01-26T00:00:00.000Z",
//       "maxFlights": 0,
//       "peakHour": "1970-01-01T00:00:00.000Z"
//   },
//  ...
// ]
