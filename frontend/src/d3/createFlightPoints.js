import { pointer, select } from 'd3';

export const createFlightPoints = ({
  svg,
  mapGroup,
  filteredFlights,
  projection,
  isSingleRegion,
  setTooltip,
  height,
}) => {
  const flightPoints = mapGroup
    .selectAll('circle.flight-point')
    .data(filteredFlights)
    .enter()
    .append('circle')
    .attr('class', 'flight-point')
    .attr('cx', (d) => {
      const coords = projection([parseFloat(d.lng), parseFloat(d.lat)]);
      return coords ? coords[0] : null;
    })
    .attr('cy', (d) => {
      const coords = projection([parseFloat(d.lng), parseFloat(d.lat)]);
      return coords ? coords[1] : null;
    })
    .attr('r', 2 / (isSingleRegion ? 1 : 2)) // Компенсируем увеличение радиуса для всей карты
    .attr('fill', '#e74c3c')
    .attr('stroke', '#c0392b')
    .attr('stroke-width', 1 / (isSingleRegion ? 1 : 2)) // Компенсируем увеличение толщины для всей карты
    .attr('opacity', 0.8)
    .on('mouseover', function (event, d) {
      select(this)
        .attr('r', 1 / (isSingleRegion ? 1 : 2))
        .attr('opacity', 1);
      const [x, y] = pointer(event, svg.node());
      setTooltip({
        visible: true,
        content: `Полет ${d.id}: ${d.date}`,
        x: x,
        y: y,
      });
    })
    .on('mouseout', function () {
      select(this)
        .attr('r', 1 / (isSingleRegion ? 1 : 2))
        .attr('opacity', 0.8);
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    });

  // Увеличение по оси Y на 1.8 для всей карты
  if (!isSingleRegion) {
    const scaleFactor = 1.8;
    const translateY = (height - height * scaleFactor) / 2;
    flightPoints.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
  }

  flightPoints
    .filter(function () {
      const cx = select(this).attr('cx');
      const cy = select(this).attr('cy');
      return cx === null || cy === null || isNaN(parseFloat(cx)) || isNaN(parseFloat(cy));
    })
    .remove();

  return flightPoints;
};
