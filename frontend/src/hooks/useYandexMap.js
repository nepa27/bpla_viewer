import { useEffect, useRef, useState } from 'react';

export const useYandexMap = ({ containerRef, center, zoom, onReady, onError }) => {
  const [ymapsReady, setYmapsReady] = useState(false);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const initializeMap = (ymapsInstance) => {
      if (!containerRef.current) {
        setTimeout(() => initializeMap(ymapsInstance), 50);
        return;
      }

      try {
        const map = new ymapsInstance.Map(containerRef.current, {
          center,
          zoom,
          controls: ['zoomControl'],
        });

        map.controls.remove('fullscreenControl');
        map.controls.remove('geolocationControl');

        map.behaviors.disable(['dblClickZoom', 'rightMouseButtonMagnifier']);

        mapInstanceRef.current = map;
        setYmapsReady(true);
        onReady?.();
      } catch (err) {
        onError?.(err);
      }
    };

    if (window.ymaps && window.ymaps.Map) {
      initializeMap(window.ymaps);
    } else {
      const checkYmaps = () => {
        if (window.ymaps && window.ymaps.Map) {
          initializeMap(window.ymaps);
        } else {
          setTimeout(checkYmaps, 100);
        }
      };
      checkYmaps();
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Ошибка при уничтожении карты:', e);
        }
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mapInstance: mapInstanceRef.current, ymapsReady };
};
