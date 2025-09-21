import { pointer, select } from 'd3';

export const createRegions = ({
  svg,
  mapGroup,
  dataToRender,
  path,
  setSelectedRegion,
  isSingleRegion,
  setTooltip,
  height,
}) => {
  const regions = mapGroup
    .selectAll('path.region')
    .data(
      dataToRender.features || [dataToRender],
      (d) => d.properties?.['hc-key'] || d.properties?.region || d.properties?.name,
    )
    .enter()
    .append('path')
    .attr('class', 'region')
    .attr('d', path)
    .attr('fill', '#34495e')
    .attr('stroke', '#2c3e50')
    .attr('stroke-width', 1 / (isSingleRegion ? 1 : 2))
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      select(this).attr('fill', '#e67e22');
      const [x, y] = pointer(event, svg.node());
      setTooltip({
        visible: true,
        content:
          d.properties?.region ||
          d.properties?.name ||
          d.properties?.['hc-key'] ||
          'Неизвестный регион',
        x: x,
        y: y,
      });
    })
    .on('mousemove', function (event) {
      const [x, y] = pointer(event, svg.node());
      setTooltip((prev) => ({ ...prev, x: x, y: y }));
    })
    .on('mouseout', function () {
      // .on('mouseout', function (event, d) {
      select(this).attr('fill', '#34495e');
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    })
    .on('click', function (event, d) {
      setSelectedRegion({
        id: d.properties?.['hc-key'] || d.properties?.region,
        name: d.properties?.region || d.properties?.name || d.properties?.['hc-key'],
        ...d.properties,
      });
    });

  // Увеличение по оси Y на 1.8 для всей карты
  if (!isSingleRegion) {
    const scaleFactor = 1.8;
    const translateY = (height - height * scaleFactor) / 2;
    regions.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
  }

  return regions;
};
