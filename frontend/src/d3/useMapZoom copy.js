import { select, zoom, zoomIdentity } from 'd3';

import { useCallback } from 'react';

const useMapZoom = () => {
  // Функция для инициализации зума
  const initializeZoom = useCallback((svgElement, gElement) => {
    if (!svgElement || !gElement) {
      console.error('SVG or Group element is missing for zoom initialization');
      return null;
    }

    const zoomEv = zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        select(gElement).attr('transform', event.transform);
      });

    select(svgElement).call(zoomEv);

    return zoomEv;
  }, []);

  // Функция для сброса зума
  const resetZoom = useCallback((svgElement, zoomBehavior) => {
    if (svgElement && zoomBehavior) {
      select(svgElement).transition().duration(750).call(zoomBehavior.transform, zoomIdentity);
    }
  }, []);

  return {
    initializeZoom,
    resetZoom,
  };
};

export default useMapZoom;

// // useMapZoom.js
// import { useCallback, useRef } from 'react';
// import * as d3 from 'd3';

// const useMapZoom = () => {
//   const zoomRef = useRef(null);

//   // Функция для инициализации зума
//   const initializeZoom = useCallback((svgElement, gElement) => {
//     if (!svgElement || !gElement) {
//       console.error('SVG or Group element is missing for zoom initialization');
//       return null;
//     }

//     const zoom = d3.zoom()
//       .scaleExtent([1, 10])
//       .on('zoom', (event) => {
//         d3.select(gElement).attr("transform", event.transform);
//         // Обработка тултипа должна быть на уровне компонента карты
//       });

//     d3.select(svgElement).call(zoom);
//     zoomRef.current = zoom;

//     return zoom;
//   }, []);

//   // Функция для сброса зума
//   const resetZoom = useCallback((svgElement, zoomBehavior) => {
//     if (svgElement && zoomBehavior) {
//       d3.select(svgElement)
//         .transition()
//         .duration(750)
//         .call(zoomBehavior.transform, d3.zoomIdentity);
//     }
//   }, []);

//   return {
//     initializeZoom,
//     resetZoom,
//     zoomRef // Если нужно получить ссылку на объект зума напрямую
//   };
// };

// export default useMapZoom;
