import { axisBottom, timeFormat } from 'd3';

export const AxisBottom = (g, x, height) => {
  // export const AxisBottom = (g, x, height, width) => {
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(axisBottom(x).tickFormat(timeFormat('%m-%d')).tickSize(0))
    .selectAll('text')
    .attr('fill', 'white')
    .style('font-size', '10px')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  // Стилизация оси
  g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
};
