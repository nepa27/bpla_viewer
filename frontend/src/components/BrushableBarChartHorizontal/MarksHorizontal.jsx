// MarksHorizontal.jsx
import { select } from 'd3';

export const Marks = (g, data, x, y) => {
  // export const Marks = (g, data, x, y, width) => {
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0) // Начинается с левого края (0)
    .attr('y', (d) => y(d.date.getTime())) // Позиция по вертикали
    .attr('width', (d) => x(d.count)) // Ширина зависит от значения count
    .attr('height', y.bandwidth()) // Высота равна ширине полосы из scaleBand
    .attr('fill', '#4CAF50')
    .on('mouseover', function () {
      // .on('mouseover', function (event, d) {
      select(this).attr('fill', '#45a049');
    })
    .on('mouseout', function () {
      select(this).attr('fill', '#4CAF50');
    });
};
