import { select, zoom, zoomIdentity } from 'd3';

import { useCallback, useState } from 'react';

export const useMapZoom = () => {
  const [currentScale, setCurrentScale] = useState(1);

  const initializeZoom = useCallback(
    (svgElement, gElement) => {
      if (!svgElement || !gElement) return null;

      const zoomEv = zoom()
        .scaleExtent([1, 100])
        .on('zoom', (event) => {
          select(gElement).attr('transform', event.transform);
          setCurrentScale(event.transform.k); // Обновляем текущий масштаб
        });

      select(svgElement).call(zoomEv);
      return zoomEv;
    },
    [setCurrentScale],
  );

  const resetZoom = useCallback(
    (svgElement, zoomBehavior) => {
      if (svgElement && zoomBehavior) {
        select(svgElement).transition().duration(750).call(zoomBehavior.transform, zoomIdentity);
        setCurrentScale(1); // Сбрасываем масштаб
      }
    },
    [setCurrentScale],
  );

  return { initializeZoom, resetZoom, currentScale };
};

// import { select, zoom, zoomIdentity } from 'd3';

// import { useCallback } from 'react';

// export const useMapZoom = () => {
//   const initializeZoom = useCallback((svgElement, gElement) => {
//     if (!svgElement || !gElement) return null;

//     const zoomEv = zoom()
//       .scaleExtent([1, 100])
//       .on('zoom', (event) => {
//         select(gElement).attr('transform', event.transform);
//       });

//     select(svgElement).call(zoomEv);
//     return zoomEv;
//   }, []);

//   const resetZoom = useCallback((svgElement, zoomBehavior) => {
//     if (svgElement && zoomBehavior) {
//       select(svgElement).transition().duration(750).call(zoomBehavior.transform, zoomIdentity);
//     }
//   }, []);

//   return { initializeZoom, resetZoom };
// };
