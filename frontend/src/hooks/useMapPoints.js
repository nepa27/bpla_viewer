import { useEffect, useRef } from 'react';

import { hasDataChanged } from './utils/hashUtils';
import { getClusterHash } from './utils/hashUtils';
import { updateMapPoints } from './utils/mapPointsProcessor';

export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
  const pointsRef = useRef([]);
  const clustererRef = useRef(null);
  const lastZoomRef = useRef(3);
  const processingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!mapInstance || !ymapsReady || !points) return;

    const processClusters = () => {
      if (pointsRef.current.length > 0 && !hasDataChanged(pointsRef.current, points)) {
        return;
      }

      const zoom = mapInstance.getZoom();
      lastZoomRef.current = zoom;

      updateMapPoints(mapInstance, points, zoom, pointsRef, clustererRef);
    };

    processClusters();

    const handleZoomChange = () => {
      const newZoom = mapInstance.getZoom();
      lastZoomRef.current = newZoom;

      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      processingTimeoutRef.current = setTimeout(() => {
        updateMapPoints(mapInstance, points, newZoom, pointsRef, clustererRef);
      }, 0);
    };

    mapInstance.events.add('zoomchange', handleZoomChange);

    return () => {
      mapInstance.events.remove('zoomchange', handleZoomChange);

      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      try {
        if (clustererRef.current && mapInstance.geoObjects) {
          mapInstance.geoObjects.remove(clustererRef.current);
        }
      } catch (e) {
        // Игнорируем ошибки очистки
      }
      pointsRef.current = [];
      clustererRef.current = null;
    };
  }, [mapInstance, ymapsReady, points]);

  return pointsRef;
};
