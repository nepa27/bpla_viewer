import { select } from 'd3';

export const Arcs = (g, data, pieGenerator, arcGenerator, color) => {
  const pieData = pieGenerator(data);

  const arcs = g.selectAll('.arc').data(pieData).enter().append('g').attr('class', 'arc');

  arcs
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d) => color(d.data.label))
    .attr('stroke', '#191923')
    .attr('stroke-width', 2)
    .on('mouseover', function () {
      select(this).attr('opacity', 0.8);
    })
    .on('mouseout', function () {
      select(this).attr('opacity', 1);
    });

  //Добавляем значения внутрь сегментов для больших сегментов
  arcs
    .filter((d) => d.endAngle - d.startAngle > 0.2)
    .append('text')
    .attr('transform', (d) => {
      const [x, y] = arcGenerator.centroid(d);
      return `translate(${x}, ${y})`;
    })
    .attr('text-anchor', 'middle')
    .attr('class', 'arc-label')
    .text((d) => `${d.data.percent}%`); // ✅ Показываем и процент, и количество
};
