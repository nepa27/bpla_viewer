import { select } from 'd3';

export const Marks = (g, data, x, y) => {
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d) => y(d.date.getTime()))
    .attr('width', (d) => x(d.count))
    .attr('height', y.bandwidth())
    .attr('fill', '#4CAF50')
    .on('mouseover', function () {
      select(this).attr('fill', '#45a049');
    })
    .on('mouseout', function () {
      select(this).attr('fill', '#4CAF50');
    });
};
