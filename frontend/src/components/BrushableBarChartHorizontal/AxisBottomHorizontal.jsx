import { axisBottom } from 'd3';

export const AxisBottom = (g, x, height) => {
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(axisBottom(x).tickSize(0))
    .selectAll('text')
    .attr('fill', 'white')
    .style('font-size', '10px');

  g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
};
