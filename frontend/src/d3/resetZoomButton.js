
    
export const resetZoomButton = (svg, mapGroup, initializeZoom, resetZoom) => {
 const zoomBehavior = initializeZoom(svg.node(), mapGroup.node());

    // Добавляем кнопку сброса зума
    const Button = svg.append('g')
      .attr('class', 'reset-zoom-button')
      .attr('transform', `translate(20, 20)`)
      .style('cursor', 'pointer')
      .on('click', () => {
        resetZoom(svg.node(), zoomBehavior);
      });

    Button.append('rect')
      .attr("height", 30)
      .attr("width", 150)
      .attr('rx', 5)
      .attr('fill', '#34495e')
      .attr('stroke', '#2c3e50')
      .attr('stroke-width', 2);

    Button.append('text')
      .attr('x', 75)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text('Сбросить зум');

      return Button;
}


