export const resetRegionButton = (svg, setSelectedRegion) => {
  // Добавляем кнопку сброса выбора региона
  const Button = svg
    .append('g')
    .attr('class', 'reset-region-button')
    .attr('transform', `translate(20, 60)`)
    .style('cursor', 'pointer')
    .on('click', () => {
      setSelectedRegion(null);
    });

  Button.append('rect')
    .attr('height', 30)
    .attr('width', 150)
    .attr('rx', 5)
    .attr('fill', '#e74c3c')
    .attr('stroke', '#c0392b')
    .attr('stroke-width', 2);

  Button.append('text')
    .attr('x', 75)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.3em')
    .attr('fill', 'white')
    .attr('font-size', '12px')
    .text('Вся Россия');

  return Button;
};
