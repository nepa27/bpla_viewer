export const Legend = (
  g,
  data,
  color,
  offsetX,
  offsetY,
  isMobile = false,
  containerWidth = 600,
) => {
  const legendItemHeight = isMobile ? 40 : 30;
  const fontSize = isMobile ? 14 : 12;
  const itemSpacing = isMobile ? 20 : 20; // Расстояние между элементами
  const itemMargin = isMobile ? 10 : 5; // Отступы слева/справа от элемента

  const legend = g
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${offsetX},${offsetY})`);

  if (isMobile) {
    // ✅ Горизонтальное размещение с переносом строк
    const maxWidth = containerWidth * 0.9; // 90% ширины контейнера
    let currentX = 0;
    let currentY = 0;
    const lineHeight = legendItemHeight;

    const legendItems = legend
      .selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d) => {
        // ✅ Примерная длина текста (в пикселях)
        const textLength = d.label.length * fontSize * 0.6 + 18 + itemMargin; // 0.6 — приблизительная ширина символа

        if (currentX + textLength > maxWidth) {
          currentX = 0;
          currentY += lineHeight;
        }

        const x = currentX;
        currentX += textLength + itemSpacing;

        return `translate(${x},${currentY})`;
      });

    legendItems
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => color(d.label));

    legendItems
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .attr('class', 'legend-label')
      .attr('font-size', fontSize)
      .text((d) => `${d.label}: ${d.percent}% (${d.value})`);
  } else {
    // ✅ Вертикальное расположение для десктопа
    const legendItems = legend
      .selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0,${i * legendItemHeight})`);

    legendItems
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => color(d.label));

    legendItems
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .attr('class', 'legend-label')
      .attr('font-size', fontSize)
      .text((d) => `${d.label}: ${d.percent}% (${d.value})`);
  }
};
