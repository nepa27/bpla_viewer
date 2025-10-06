import { useEffect, useRef } from 'react';

import { updateMapPoints } from './utils/mapPointsProcessor';

export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
  const pointsRef = useRef([]);
  const clustererRef = useRef(null);
  const pointsHashRef = useRef('');
  const processingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!mapInstance || !ymapsReady || !points) return;

    // Очищаем предыдущий таймер
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    const processClusters = () => {
      const zoom = mapInstance.getZoom();
      updateMapPoints(mapInstance, points, zoom, pointsRef, clustererRef, pointsHashRef);
    };

    processClusters();

    const handleZoomChange = () => {
      const newZoom = mapInstance.getZoom();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => {
        updateMapPoints(mapInstance, points, newZoom, pointsRef, clustererRef, pointsHashRef);
      }, 0);
    };

    mapInstance.events.add('zoomchange', handleZoomChange);

    return () => {
      mapInstance.events.remove('zoomchange', handleZoomChange);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (clustererRef.current && mapInstance?.geoObjects) {
        try {
          mapInstance.geoObjects.remove(clustererRef.current);
        } catch (e) {
          console.warn('Ошибка удаления кластера:', e);
        }
      }
      pointsRef.current = [];
      clustererRef.current = null;
      pointsHashRef.current = '';
    };
  }, [mapInstance, ymapsReady, points]);

  return pointsRef;
};
