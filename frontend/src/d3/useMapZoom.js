import { select, zoom, zoomIdentity } from 'd3';

import { useCallback } from 'react';

export const useMapZoom = () => {
  const initializeZoom = useCallback((svgElement, gElement) => {
    if (!svgElement || !gElement) return null;

    const zoomEv = zoom()
      .scaleExtent([1, 100])
      .on('zoom', (event) => {
        select(gElement).attr('transform', event.transform);
      });

    select(svgElement).call(zoomEv);
    return zoomEv;
  }, []);

  const resetZoom = useCallback((svgElement, zoomBehavior) => {
    if (svgElement && zoomBehavior) {
      select(svgElement).transition().duration(750).call(zoomBehavior.transform, zoomIdentity);
    }
  }, []);

  return { initializeZoom, resetZoom };
};
