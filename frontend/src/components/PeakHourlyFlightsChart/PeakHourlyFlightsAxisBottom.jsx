import { axisBottom, timeFormat } from 'd3';

export const PeakHourlyFlightsAxisBottom = (g, x, height, width) => {
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(axisBottom(x).tickFormat(timeFormat('%d.%m')).tickSize(0))
    .selectAll('text')
    .attr('fill', 'white')
    .style('font-size', width < 768 ? '8px' : '10px')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
};
