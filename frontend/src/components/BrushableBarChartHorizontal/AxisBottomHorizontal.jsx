// AxisBottomHorizontal.jsx
import { axisBottom } from 'd3';

export const AxisBottom = (g, x, height) => {
  // export const AxisBottom = (g, x, height, width) => {
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`) // Перемещаем ось вниз
    .call(axisBottom(x).tickSize(0)) // Ось X внизу
    .selectAll('text')
    .attr('fill', 'white')
    .style('font-size', '10px');

  // Стилизация оси
  g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
};
