import { pointer, select } from 'd3';

import { getColorForValue } from '../utils/colorScale';

export const createRegionsWithFlightData = ({
  svg,
  mapGroup,
  dataToRender,
  path,
  setSelectedRegion,
  isSingleRegion,
  setTooltip,
  height,
  flightsByRegion,
  maxFlightsInRegion,
}) => {
  const regions = mapGroup
    .selectAll('path.region')
    .data(
      dataToRender.features || [dataToRender],
      (d) => d.properties?.region_id || d.properties?.region || d.properties?.name,
    )
    .enter()
    .append('path')
    .attr('class', 'region')
    .attr('d', path)
    .attr('fill', (d) => {
      const regionName = d.properties?.region || 'Не определен';
      const flightCount = flightsByRegion?.get(regionName) || 0;
      const normalizedValue = maxFlightsInRegion > 0 ? flightCount / maxFlightsInRegion : 0;
      return getColorForValue(normalizedValue);
    })
    .attr('stroke', '#2c3e50')
    .attr('stroke-width', 1 / (isSingleRegion ? 1 : 2))
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      select(this).attr('stroke', '#ffffff').attr('stroke-width', 2);
      const [x, y] = pointer(event, svg.node());
      const regionName =
        d.properties?.region ||
        d.properties?.name ||
        d.properties?.region_id ||
        'Неизвестный регион';
      const flightCount = flightsByRegion?.get(regionName) || 0;
      const content = `${regionName}<br/>Полетов: ${flightCount}`;

      setTooltip({
        visible: true,
        content: content,
        x: x,
        y: y,
      });
    })
    .on('mousemove', function (event) {
      const [x, y] = pointer(event, svg.node());
      setTooltip((prev) => ({ ...prev, x: x, y: y }));
    })
    .on('mouseout', function () {
      select(this)
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 1 / (isSingleRegion ? 1 : 2));
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    })
    .on('click', function (event, d) {
      setSelectedRegion({ ...d.properties });
    });

  if (!isSingleRegion) {
    const scaleFactor = 1.8;
    const translateY = (height - height * scaleFactor) / 2;
    regions.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
  }

  return regions;
};
