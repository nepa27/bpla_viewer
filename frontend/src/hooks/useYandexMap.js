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
        // Создаем карту только с кнопками масштабирования
        const map = new ymapsInstance.Map(containerRef.current, {
          center,
          zoom,
          controls: ['zoomControl'],
        });

        // Явно удаляем ненужные элементы управления
        map.controls.remove('fullscreenControl');
        map.controls.remove('geolocationControl');

        // Отключаем нежелательные поведения
        map.behaviors.disable([
          'dblClickZoom',
          'rightMouseButtonMagnifier',
          // 'scrollZoom'
        ]);

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
//   import { useState, useEffect, useRef } from 'react';

// export const useYandexMap = ({
//   containerRef,
//   center,
//   zoom,
//   onReady,
//   onError
// }) => {
//   const [mapInstance, setMapInstance] = useState(null);
//   const [ymapsReady, setYmapsReady] = useState(false);
//   const mapInstanceRef = useRef(null);
//   const initializedRef = useRef(false);

//   useEffect(() => {
//     console.log('useYandexMap: начата инициализация');

//     const initializeMap = (ymapsInstance) => {
//       console.log('useYandexMap: попытка создания карты, containerRef:', containerRef.current);

//       // Ждем, пока контейнер будет доступен
//       if (!containerRef.current) {
//         console.log('useYandexMap: нет контейнера, повторная попытка через 50ms');
//         setTimeout(() => initializeMap(ymapsInstance), 50);
//         return;
//       }

//       // Проверяем, не инициализирована ли уже карта
//       if (initializedRef.current) {
//         console.log('useYandexMap: карта уже инициализирована');
//         onReady?.();
//         return;
//       }

//       try {
//         console.log('useYandexMap: создание новой карты');
//         const map = new ymapsInstance.Map(containerRef.current, {
//           center,
//           zoom,
//           controls: ['zoomControl']
//         });

//         map.behaviors.disable([
//           'dblClickZoom',
//           'rightMouseButtonMagnifier',
//           'scrollZoom'
//         ]);

//         mapInstanceRef.current = map;
//         setMapInstance(map);
//         initializedRef.current = true;

//         setYmapsReady(true);
//         console.log('useYandexMap: карта создана успешно, вызываем onReady');
//         onReady?.();
//       } catch (err) {
//         console.error('useYandexMap: ошибка создания карты', err);
//         onError?.(err);
//       }
//     };

//     // Проверяем, загружен ли ymaps
//     if (window.ymaps && window.ymaps.Map) {
//       console.log('useYandexMap: ymaps уже загружен');
//       initializeMap(window.ymaps);
//     } else {
//       console.log('useYandexMap: ожидание загрузки ymaps');
//       // Ждем загрузки Yandex Maps API
//       const checkYmaps = () => {
//         if (window.ymaps && window.ymaps.Map) {
//           console.log('useYandexMap: ymaps загружен, инициализация карты');
//           initializeMap(window.ymaps);
//         } else {
//           console.log('useYandexMap: ymaps еще не загружен, повторная проверка через 100ms');
//           setTimeout(checkYmaps, 100);
//         }
//       };
//       checkYmaps();
//     }

//     // Очистка при размонтировании
//     return () => {
//       console.log('useYandexMap: очистка');
//       if (mapInstanceRef.current) {
//         try {
//           mapInstanceRef.current.destroy();
//         } catch (e) {
//           console.warn('Ошибка при уничтожении карты:', e);
//         }
//         mapInstanceRef.current = null;
//         setMapInstance(null);
//         initializedRef.current = false;
//       }
//     };
//   }, []);

//   console.log('useYandexMap: возвращаем значения', {
//     mapInstance: !!mapInstanceRef.current,
//     ymapsReady,
//     mapInstanceRef: !!mapInstanceRef.current
//   });

//   return { mapInstance: mapInstanceRef.current, ymapsReady, mapInstanceRef };
// };
