// d3/useMapZoom.js (упрощенная версия)
import { useCallback } from 'react';
import * as d3 from 'd3';

export const useMapZoom = () => {
  const initializeZoom = useCallback((svgElement, gElement) => {
    if (!svgElement || !gElement) return null;

    const zoom = d3.zoom()
      .scaleExtent([1, 100])
      .on('zoom', (event) => {
        d3.select(gElement).attr("transform", event.transform);
      });

    d3.select(svgElement).call(zoom);
    return zoom;
  }, []);

  const resetZoom = useCallback((svgElement, zoomBehavior) => {
    if (svgElement && zoomBehavior) {
      d3.select(svgElement)
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    }
  }, []);

  return { initializeZoom, resetZoom };
};