/* eslint-disable no-unused-vars */
import { useCallback, useRef, useState } from 'react';

import { useMapPoints } from '../hooks/useMapPoints';
import { useMapPolygons } from '../hooks/useMapPolygons';
import { useYandexMap } from '../hooks/useYandexMap';
import FallBackMap from './FallBackMap';
import './MapComponent.css';

const MapComponent = ({ regionsData, points = [], errorLoadYmaps }) => {
  const mapContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRegionClick = useCallback((region) => {
    alert(`Вы выбрали регион: ${region}`);
    setSelectedRegion(region);
  }, []);

  // Используем существующий хук для инициализации карты
  const { mapInstance, ymapsReady } = useYandexMap({
    containerRef: mapContainerRef,
    center: [69, 100],
    zoom: 3,
    onReady: () => {
      setIsLoading(false);
      setError(null);
    },
    onError: (err) => {
      console.error('Ошибка инициализации карты:', err);
      setError(`Ошибка инициализации карты: ${err.message}`);
      setIsLoading(false);
    },
  });

  // Используем существующий хук для отрисовки полигонов с мемоизацией
  const polygonsRef = useMapPolygons({
    mapInstance,
    ymapsReady,
    regionsData,
    selectedRegion,
    onRegionClick: handleRegionClick,
  });

  // Используем существующий хук для отрисовки точек
  const pointsRef = useMapPoints({
    mapInstance,
    ymapsReady,
    points,
  });

  // Если есть ошибка загрузки Yandex Maps - показываем fallback
  if (errorLoadYmaps && regionsData) {
    return (
      <div className="map-container">
        <FallBackMap geoData={regionsData} flightsData={points} />
      </div>
    );
  }

  // Если есть ошибка карты и есть данные - показываем fallback
  if (error && regionsData) {
    return (
      <div className="map-container">
        <FallBackMap geoData={regionsData} flightsData={points} />
      </div>
    );
  }

  // Если есть ошибка, но нет данных для fallback
  if (error && !regionsData) {
    return <div className="map-error">Ошибка: {error}</div>;
  }

  // Обычный рендер карты
  return (
    <div className="map-container">
      {isLoading && <div className="map-loading">Загрузка данных карты...</div>}

      <div ref={mapContainerRef} className="map-element" />
    </div>
  );
};

export default MapComponent;

// Рабочий Вариант

// import React, { useState, useEffect, useRef } from 'react';
// import FallBackMap from './FallBackMap';
// import './MapComponent.css';

// const MapComponent = ({ regionsData, points = [], errorLoadYmaps }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const mapContainerRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const polygonsRef = useRef([]);
//   const pointsRef = useRef([]);

//   const handleRegionClick = (region) => {
//     alert(`Вы выбрали регион: ${region}`);
//   };

//   // Основной эффект для инициализации карты
//   useEffect(() => {
//     // Если есть ошибка загрузки Yandex Maps - не пытаемся создавать карту
//     if (errorLoadYmaps) {
//       setIsLoading(false);
//       return;
//     }

//     // Проверка корректности данных GeoJSON
//     if (regionsData && (!regionsData.features || !Array.isArray(regionsData.features))) {
//       setError('Некорректные данные границ регионов');
//       setIsLoading(false);
//       return;
//     }

//     let ymaps = window.ymaps;

//     // Функция инициализации карты
//     const initializeMap = (ymapsInstance) => {
//       if (!mapContainerRef.current) return;

//       try {
//         // Создаем карту только если она еще не создана
//         if (!mapInstanceRef.current) {
//           const map = new ymapsInstance.Map(mapContainerRef.current, {
//             center: [60, 100],
//             zoom: 3,
//             controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
//           });
//           mapInstanceRef.current = map;
//         }

//         const map = mapInstanceRef.current;

//         // Очищаем предыдущие полигоны
//         polygonsRef.current.forEach(p => {
//           if (p.setParent) p.setParent(null);
//         });
//         polygonsRef.current = [];

//         // Добавление регионов
//         if (regionsData?.features) {
//           regionsData.features.forEach((region, index) => {
//             if (!region.geometry?.coordinates) {
//               return;
//             }

//             try {
//               let polygonsToAdd = [];

//               if (region.geometry.type === "MultiPolygon") {
//                 region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
//                   const polygon = new ymapsInstance.Polygon(
//                     polygonCoords,
//                     {
//                       name: region.properties?.region || `Регион ${index}-${polyIndex}`,
//                       hintContent: region.properties?.region || `Регион ${index}-${polyIndex}`,
//                     },
//                     {
//                       fillColor: selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
//                       strokeColor: '#000000',
//                       strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
//                       opacity: 0.7,
//                       cursor: 'pointer'
//                     }
//                   );

//                   polygon.events.add('click', () => {
//                     const regionName = region.properties?.region;
//                     setSelectedRegion(regionName);
//                     handleRegionClick(regionName);
//                   });

//                   polygonsToAdd.push(polygon);
//                 });
//               } else if (region.geometry.type === "Polygon") {
//                 const polygon = new ymapsInstance.Polygon(
//                   region.geometry.coordinates,
//                   {
//                     name: region.properties?.region || `Регион ${index}`,
//                     hintContent: region.properties?.region || `Регион ${index}`,
//                   },
//                   {
//                     fillColor: selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
//                     strokeColor: '#000000',
//                     strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
//                     opacity: 0.7,
//                     cursor: 'pointer'
//                   }
//                 );

//                 polygon.events.add('click', () => {
//                   const regionName = region.properties?.region;
//                   setSelectedRegion(regionName);
//                   handleRegionClick(regionName);
//                 });

//                 polygonsToAdd.push(polygon);
//               }

//               polygonsToAdd.forEach(polygon => {
//                 map.geoObjects.add(polygon);
//                 polygonsRef.current.push(polygon);
//               });

//             } catch (regionError) {
//               console.warn(`Ошибка добавления региона ${index}:`, regionError);
//             }
//           });
//         }

//         setError(null);
//       } catch (err) {
//         console.error('Ошибка инициализации карты:', err);
//         setError(`Ошибка инициализации карты: ${err.message}`);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Проверяем, загружен ли ymaps
//     if (ymaps && ymaps.Map) {
//       initializeMap(ymaps);
//     } else {
//       // Ждем загрузки Yandex Maps API
//       const checkYmaps = () => {
//         if (window.ymaps && window.ymaps.Map) {
//           initializeMap(window.ymaps);
//         } else {
//           setTimeout(checkYmaps, 100);
//         }
//       };
//       checkYmaps();
//     }

//     // Очистка при размонтировании
//     return () => {
//       if (mapInstanceRef.current) {
//         try {
//           mapInstanceRef.current.destroy();
//         } catch (e) {
//           console.warn('Ошибка при уничтожении карты:', e);
//         }
//         mapInstanceRef.current = null;
//       }
//       polygonsRef.current.forEach(p => {
//         if (p.setParent) p.setParent(null);
//       });
//       polygonsRef.current = [];
//       pointsRef.current.forEach(p => {
//         if (p.setParent) p.setParent(null);
//       });
//       pointsRef.current = [];
//     };
//   }, [regionsData, selectedRegion, errorLoadYmaps]);

//   // Отдельный эффект для обновления точек
//   useEffect(() => {
//     // Не обновляем точки если есть ошибка загрузки Yandex Maps
//     if (errorLoadYmaps) return;

//     if (!mapInstanceRef.current || !window.ymaps) return;

//     const ymaps = window.ymaps;
//     const map = mapInstanceRef.current;

//     // Очищаем старые точки
//     pointsRef.current.forEach(point => {
//       if (point.setParent) point.setParent(null);
//     });
//     pointsRef.current = [];

//     // Добавляем новые точки
//     points.forEach((point, idx) => {
//       if (point.lat == null || point.lng == null) return;

//       try {
//         const placemark = new ymaps.Placemark(
//           [point.lat, point.lng],
//           {
//             hintContent: `${point.type || 'Точка'} ${idx + 1}`,
//             balloonContent: `<b>Дата:</b> ${point.date || ''}<br><b>Тип:</b> ${point.type || ''}`
//           },
//           {
//             preset: 'islands#redCircleIcon'
//           }
//         );
//         map.geoObjects.add(placemark);
//         pointsRef.current.push(placemark);
//       } catch (pointError) {
//         console.warn(`Ошибка добавления точки ${idx}:`, pointError);
//       }
//     });
//   }, [points, errorLoadYmaps]);

//   // Если есть ошибка загрузки Yandex Maps или ошибка карты и есть данные - показываем fallback
//   if ((errorLoadYmaps || error) && regionsData) {
//     return (
//       <div className="map-container">
//         <FallBackMap
//           geoData={regionsData}
//           flightsData={points}
//         />
//       </div>
//     );
//   }

//   // Если есть ошибка, но нет данных для fallback
//   if ((error || errorLoadYmaps) && !regionsData) {
//     return (
//       <div className="map-error">
//         Ошибка: {error || 'Ошибка загрузки карты'}
//       </div>
//     );
//   }

//   // Обычный рендер карты
//   return (
//     <div className="map-container">
//       {isLoading && (
//         <div className="map-loading">
//           Загрузка данных карты...
//         </div>
//       )}

//       <div
//         ref={mapContainerRef}
//         className="map-element"
//       />
//     </div>
//   );
// };

// export default MapComponent;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import FallBackMap from './FallBackMap';
// import './MapComponent.css';

// const YandexMap = ({ containerRef, center, zoom }) => {
//   const initializedRef = useRef(false);

//   useEffect(() => {
//     if (!containerRef.current || initializedRef.current) return;

//     const initMap = () => {
//       if (window.ymaps && window.ymaps.Map && containerRef.current) {
//         try {
//           const map = new window.ymaps.Map(containerRef.current, {
//             center,
//             zoom,
//             controls: ['zoomControl']
//           });

//           map.behaviors.disable([
//             'dblClickZoom',
//             'rightMouseButtonMagnifier',
//             'scrollZoom'
//           ]);

//           initializedRef.current = true;
//           console.log('YandexMap: карта создана');

//           // Очистка при размонтировании
//           return () => {
//             try {
//               map.destroy();
//             } catch (e) {
//               console.warn('Ошибка при уничтожении карты:', e);
//             }
//           };
//         } catch (err) {
//           console.error('YandexMap: ошибка создания карты', err);
//         }
//       }
//     };

//     // Проверяем сразу
//     initMap();

//     // И через небольшую задержку на случай, если DOM еще не готов
//     const timer = setTimeout(initMap, 100);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [containerRef, center, zoom]);

//   return null;
// };

// const MapComponent = ({ regionsData, points = [], errorLoadYmaps }) => {
//   const mapContainerRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [key, setKey] = useState(0); // Для пересоздания компонента

//   // Имитируем загрузку Yandex Maps
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (window.ymaps && window.ymaps.Map) {
//         console.log('MapComponent: Yandex Maps API доступен');
//         setIsLoading(false);
//         setMapLoaded(true);
//         setHasError(false);
//       } else {
//         console.log('MapComponent: Yandex Maps API недоступен');
//         setIsLoading(false);
//         setMapLoaded(false);
//         setHasError(true);
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, []);

//   // Если есть ошибка и данные доступны - показываем fallback
//   if ((hasError || errorLoadYmaps) && regionsData) {
//     console.log('MapComponent: ПОКАЗЫВАЕМ FALLBACK');
//     return (
//       <div style={{ width: '100%', height: '600px' }}>
//         <FallBackMap
//           geoData={regionsData}
//           flightsData={points}
//         />
//       </div>
//     );
//   }

//   // Если карта загружена успешно - показываем обычную карту
//   if (mapLoaded && !hasError) {
//     console.log('MapComponent: ПОКАЗЫВАЕМ ОБЫЧНУЮ КАРТУ');
//     return (
//       <div className="map-container" key={key}>
//         <YandexMap
//           containerRef={mapContainerRef}
//           center={[70, 100]}
//           zoom={3}
//         />
//         <div
//           ref={mapContainerRef}
//           className="map-element"
//         />
//       </div>
//     );
//   }

//   // Во всех остальных случаях показываем загрузку
//   return (
//     <div className="map-container" style={{ width: '100%', height: '600px', position: 'relative' }}>
//       {isLoading && (
//         <div className="map-loading">
//           Загрузка данных карты...
//         </div>
//       )}

//       <div
//         ref={mapContainerRef}
//         className="map-element"
//         style={{
//           width: '100%',
//           height: '100%'
//         }}
//       />
//     </div>
//   );
// };

// export default MapComponent;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useYandexMap } from '../hooks/useYandexMap';
// import FallBackMap from './FallBackMap';
// import './MapComponent.css';

// const MapComponent = ({ regionsData, points = [], errorLoadYmaps}) => {
//   const mapContainerRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [selectedRegion, setSelectedRegion] = useState(null);

//   const handleRegionClick = useCallback((region) => {
//     alert(`Вы выбрали регион: ${region}`);
//     setSelectedRegion(region);
//   }, []);

//   // Инициализация карты
//   const { mapInstance, ymapsReady } = useYandexMap({
//     containerRef: mapContainerRef,
//     center: [70, 100],
//     zoom: 3,
//     onReady: () => {
//       console.log('Карта успешно загружена');
//       setIsLoading(false);
//       setMapLoaded(true);
//       setHasError(false);
//     },
//     onError: (err) => {
//       console.log('Ошибка загрузки карты:', err.message);
//       setIsLoading(false);
//       setMapLoaded(false);
//       setHasError(true);
//     }
//   });

//   // Если есть ошибка и данные доступны - показываем fallback
//   if ( regionsData, errorLoadYmaps) {
//     console.log('ПОКАЗЫВАЕМ FALLBACK ИЗ-ЗА ОШИБКИ');
//     return (
//       <div style={{ width: '100%', height: '600px' }}>
//         <FallBackMap
//           geoData={regionsData}
//           flightsData={points}
//         />
//       </div>
//     );
//   }
//   console.log('mapLoaded > ', mapLoaded , hasError);
//   // Если карта загружена успешно - показываем обычную карту
//   if (mapLoaded && !hasError) {
//     return (
//       <div className="map-container">
//         <div
//           ref={mapContainerRef}
//           className="map-element"
//         />
//       </div>
//     );
//   }

//   // Во всех остальных случаях показываем загрузку
//   return (
//     <div className="map-container">
//       {isLoading && (
//         <div className="map-loading">
//           Загрузка данных карты...
//         </div>
//       )}

//       {hasError && !regionsData && (
//         <div className="map-error">
//           Ошибка загрузки карты. Данные недоступны.
//         </div>
//       )}
//     </div>
//   );
// };

// export default MapComponent;
// import { useState, useEffect, useRef } from 'react';

// const MapComponent = ({ regionsData, points = [] }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const mapContainerRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const polygonsRef = useRef([]);
//   const pointsRef = useRef([]);

//   const handleRegionClick = (region) => {
//     alert(`Вы выбрали регион: ${region}`);
//   };

//   useEffect(() => {
//     // Проверка корректности данных GeoJSON
//     if (!regionsData || !regionsData.features || !Array.isArray(regionsData.features)) {
//       console.error('Некорректные данные GeoJSON', regionsData);
//       setError('Некорректные данные границ регионов');
//       setIsLoading(false);
//       return;
//     }

//     let ymaps = window.ymaps;

//     // Функция инициализации карты
//     const initializeMap = (ymapsInstance) => {
//       if (!mapContainerRef.current) return;

//       try {
//         // Создаем карту только если она еще не создана
//         if (!mapInstanceRef.current) {
//           const map = new ymapsInstance.Map(mapContainerRef.current, {
//             center: [60, 100],
//             zoom: 3,
//             controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
//           });
//           mapInstanceRef.current = map;
//         }

//         const map = mapInstanceRef.current;

//         // Очищаем предыдущие полигоны
//         polygonsRef.current.forEach(p => {
//           if (p.setParent) p.setParent(null);
//         });
//         polygonsRef.current = [];

//         // Добавление регионов
//         regionsData.features.forEach((region, index) => {
//           if (!region.geometry?.coordinates) {
//             return;
//           }

//           try {
//             let polygonsToAdd = [];

//             if (region.geometry.type === "MultiPolygon") {
//               region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
//                 const polygon = new ymapsInstance.Polygon(
//                   polygonCoords,
//                   {
//                     name: region.properties?.region || `Регион ${index}-${polyIndex}`,
//                     hintContent: region.properties?.region || `Регион ${index}-${polyIndex}`,
//                   },
//                   {
//                     fillColor: selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
//                     strokeColor: '#000000',
//                     strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
//                     opacity: 0.7,
//                     cursor: 'pointer'
//                   }
//                 );

//                 polygon.events.add('click', () => {
//                   const regionName = region.properties?.region;
//                   console.log('Клик по региону:', regionName);
//                   setSelectedRegion(regionName);
//                   handleRegionClick(regionName);
//                 });

//                 polygonsToAdd.push(polygon);
//               });
//             } else if (region.geometry.type === "Polygon") {
//               const polygon = new ymapsInstance.Polygon(
//                 region.geometry.coordinates,
//                 {
//                   name: region.properties?.region || `Регион ${index}`,
//                   hintContent: region.properties?.region || `Регион ${index}`,
//                 },
//                 {
//                   fillColor: selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
//                   strokeColor: '#000000',
//                   strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
//                   opacity: 0.7,
//                   cursor: 'pointer'
//                 }
//               );

//               polygon.events.add('click', () => {
//                 const regionName = region.properties?.region;
//                 console.log('Клик по региону:', regionName);
//                 setSelectedRegion(regionName);
//                 handleRegionClick(regionName);
//               });

//               polygonsToAdd.push(polygon);
//             }

//             polygonsToAdd.forEach(polygon => {
//               map.geoObjects.add(polygon);
//               polygonsRef.current.push(polygon);
//             });

//           } catch (regionError) {
//             console.warn(`Ошибка добавления региона ${index}:`, regionError);
//           }
//         });

//         setError(null);
//       } catch (err) {
//         console.error('Ошибка инициализации карты:', err);
//         setError(`Ошибка инициализации карты: ${err.message}`);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Проверяем, загружен ли ymaps
//     if (ymaps && ymaps.Map) {
//       initializeMap(ymaps);
//     } else {
//       // Ждем загрузки Yandex Maps API
//       const checkYmaps = () => {
//         if (window.ymaps && window.ymaps.Map) {
//           initializeMap(window.ymaps);
//         } else {
//           setTimeout(checkYmaps, 100);
//         }
//       };
//       checkYmaps();
//     }

//     // Очистка при размонтировании
//     return () => {
//       if (mapInstanceRef.current) {
//         try {
//           mapInstanceRef.current.destroy();
//         } catch (e) {
//           console.warn('Ошибка при уничтожении карты:', e);
//         }
//         mapInstanceRef.current = null;
//       }
//       polygonsRef.current.forEach(p => {
//         if (p.setParent) p.setParent(null);
//       });
//       polygonsRef.current = [];
//       pointsRef.current.forEach(p => {
//         if (p.setParent) p.setParent(null);
//       });
//       pointsRef.current = [];
//     };
//   }, [regionsData, selectedRegion]);

//   // Отдельный эффект для обновления точек
//   useEffect(() => {
//     if (!mapInstanceRef.current || !window.ymaps) return;

//     const ymaps = window.ymaps;
//     const map = mapInstanceRef.current;

//     // Очищаем старые точки
//     pointsRef.current.forEach(point => {
//       if (point.setParent) point.setParent(null);
//     });
//     pointsRef.current = [];

//     // Добавляем новые точки
//     points.forEach((point, idx) => {
//       if (point.lat == null || point.lng == null) return;

//       try {
//         const placemark = new ymaps.Placemark(
//           [point.lat, point.lng],
//           {
//             hintContent: `${point.type || 'Точка'} ${idx + 1}`,
//             balloonContent: `<b>Дата:</b> ${point.date}<br><b>Тип:</b> ${point.type}`
//           },
//           {
//             preset: 'islands#redCircleIcon'
//           }
//         );
//         map.geoObjects.add(placemark);
//         pointsRef.current.push(placemark);
//       } catch (pointError) {
//         console.warn(`Ошибка добавления точки ${idx}:`, pointError);
//       }
//     });
//   }, [points]);

//   if (error) {
//     return (
//       <div style={{
//         width: '100%',
//         height: '600px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         color: 'red',
//         border: '1px solid #ccc'
//       }}>
//         Ошибка: {error}
//       </div>
//     );
//   }

//   return (
//     <div style={{ width: '100%', height: '600px', position: 'relative' }}>
//       {isLoading && (
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: 'rgba(255, 255, 255, 0.8)',
//           zIndex: 1000,
//           fontSize: '18px'
//         }}>
//           Загрузка данных карты...
//         </div>
//       )}

//       <div
//         ref={mapContainerRef}
//         style={{ width: '100%', height: '100%' }}
//       />
//     </div>
//   );
// };

// export default MapComponent;
