// components/BrushableBarChart/Marks.jsx
import { select } from 'd3';

export const Marks = (g, data, x, y, height) => {
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(d.date.getTime()))
    .attr('y', (d) => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', (d) => height - y(d.count))
    .attr('fill', '#4CAF50')
    .on('mouseover', function () {
      select(this).attr('fill', '#45a049');
    })
    .on('mouseout', function () {
      select(this).attr('fill', '#4CAF50');
    });
};

// import { select } from 'd3';

// export const Marks = (g, data, x, y, height) => {
//   g.selectAll('.bar')
//     .data(data)
//     .enter()
//     .append('rect')
//     .attr('class', 'bar')
//     .attr('x', (d) => x(d.date.getTime()))
//     .attr('y', (d) => y(d.count))
//     .attr('width', x.bandwidth())
//     .attr('height', (d) => height - y(d.count))
//     .attr('fill', '#4CAF50')
//     .on('mouseover', function () {
//       // .on('mouseover', function (event, d) {
//       select(this).attr('fill', '#45a049');
//     })
//     .on('mouseout', function () {
//       select(this).attr('fill', '#4CAF50');
//     });
// };
