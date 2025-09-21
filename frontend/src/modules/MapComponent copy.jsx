import { useEffect, useRef, useState } from 'react';

const MapComponent = ({ regionsData, points = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonsRef = useRef([]);
  const pointsRef = useRef([]);

  const handleRegionClick = (region) => {
    alert(`Вы выбрали регион: ${region}`);
  };

  useEffect(() => {
    // Проверка корректности данных GeoJSON
    if (!regionsData || !regionsData.features || !Array.isArray(regionsData.features)) {
      console.error('Некорректные данные GeoJSON', regionsData);
      setError('Некорректные данные границ регионов');
      setIsLoading(false);
      return;
    }

    let ymaps = window.ymaps;

    // Функция инициализации карты
    const initializeMap = (ymapsInstance) => {
      if (!mapContainerRef.current) return;

      try {
        // Создаем карту только если она еще не создана
        if (!mapInstanceRef.current) {
          const map = new ymapsInstance.Map(mapContainerRef.current, {
            center: [60, 100],
            zoom: 3,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
          });
          mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        // Очищаем предыдущие полигоны
        polygonsRef.current.forEach((p) => {
          if (p.setParent) p.setParent(null);
        });
        polygonsRef.current = [];

        // Добавление регионов
        regionsData.features.forEach((region, index) => {
          if (!region.geometry?.coordinates) {
            return;
          }

          try {
            let polygonsToAdd = [];

            if (region.geometry.type === 'MultiPolygon') {
              region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
                const polygon = new ymapsInstance.Polygon(
                  polygonCoords,
                  {
                    name: region.properties?.region || `Регион ${index}-${polyIndex}`,
                    hintContent: region.properties?.region || `Регион ${index}-${polyIndex}`,
                  },
                  {
                    fillColor:
                      selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
                    strokeColor: '#000000',
                    strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
                    opacity: 0.7,
                    cursor: 'pointer',
                  },
                );

                polygon.events.add('click', () => {
                  const regionName = region.properties?.region;
                  console.log('Клик по региону:', regionName);
                  setSelectedRegion(regionName);
                  handleRegionClick(regionName);
                });

                polygonsToAdd.push(polygon);
              });
            } else if (region.geometry.type === 'Polygon') {
              const polygon = new ymapsInstance.Polygon(
                region.geometry.coordinates,
                {
                  name: region.properties?.region || `Регион ${index}`,
                  hintContent: region.properties?.region || `Регион ${index}`,
                },
                {
                  fillColor:
                    selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
                  strokeColor: '#000000',
                  strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
                  opacity: 0.7,
                  cursor: 'pointer',
                },
              );

              polygon.events.add('click', () => {
                const regionName = region.properties?.region;
                console.log('Клик по региону:', regionName);
                setSelectedRegion(regionName);
                handleRegionClick(regionName);
              });

              polygonsToAdd.push(polygon);
            }

            polygonsToAdd.forEach((polygon) => {
              map.geoObjects.add(polygon);
              polygonsRef.current.push(polygon);
            });
          } catch (regionError) {
            console.warn(`Ошибка добавления региона ${index}:`, regionError);
          }
        });

        setError(null);
      } catch (err) {
        console.error('Ошибка инициализации карты:', err);
        setError(`Ошибка инициализации карты: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // Проверяем, загружен ли ymaps
    if (ymaps && ymaps.Map) {
      initializeMap(ymaps);
    } else {
      // Ждем загрузки Yandex Maps API
      const checkYmaps = () => {
        if (window.ymaps && window.ymaps.Map) {
          initializeMap(window.ymaps);
        } else {
          setTimeout(checkYmaps, 100);
        }
      };
      checkYmaps();
    }

    // Очистка при размонтировании
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Ошибка при уничтожении карты:', e);
        }
        mapInstanceRef.current = null;
      }
      polygonsRef.current.forEach((p) => {
        if (p.setParent) p.setParent(null);
      });
      polygonsRef.current = [];
      pointsRef.current.forEach((p) => {
        if (p.setParent) p.setParent(null);
      });
      pointsRef.current = [];
    };
  }, [regionsData, selectedRegion]);

  // Отдельный эффект для обновления точек
  useEffect(() => {
    if (!mapInstanceRef.current || !window.ymaps) return;

    const ymaps = window.ymaps;
    const map = mapInstanceRef.current;

    // Очищаем старые точки
    pointsRef.current.forEach((point) => {
      if (point.setParent) point.setParent(null);
    });
    pointsRef.current = [];

    // Добавляем новые точки
    points.forEach((point, idx) => {
      if (point.lat == null || point.lng == null) return;

      try {
        const placemark = new ymaps.Placemark(
          [point.lat, point.lng],
          {
            hintContent: `${point.type || 'Точка'} ${idx + 1}`,
            balloonContent: `<b>Дата:</b> ${point.date}<br><b>Тип:</b> ${point.type}`,
          },
          {
            preset: 'islands#redCircleIcon',
          },
        );
        map.geoObjects.add(placemark);
        pointsRef.current.push(placemark);
      } catch (pointError) {
        console.warn(`Ошибка добавления точки ${idx}:`, pointError);
      }
    });
  }, [points]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
          border: '1px solid #ccc',
        }}
      >
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            fontSize: '18px',
          }}
        >
          Загрузка данных карты...
        </div>
      )}

      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent;

// import { useState, useEffect, useRef } from 'react';

// const MapComponent = ({ regionsData={type: 'FeatureCollection', features:[]}, points = [], onRegionClick }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const mapContainerRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const polygonsRef = useRef([]); // Для хранения ссылок на полигоны
//   const pointsRef = useRef([]); // Для хранения ссылок на точки

//   useEffect(() => {
//     // Проверка корректности данных GeoJSON
//     if (!regionsData || !Array.isArray(regionsData.features)) {
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
//             center: [60, 100], // Центр России
//             zoom: 3,
//             controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
//           });
//           mapInstanceRef.current = map;
//         }

//         const map = mapInstanceRef.current;

//         // Очищаем предыдущие полигоны только при первой загрузке
//         if (polygonsRef.current.length === 0) {
//           // Добавление регионов
//           regionsData.features.forEach((region, index) => {
//             if (!region.geometry?.coordinates) {
//               return;
//             }

//             try {
//               let polygonsToAdd = [];

//               if (region.geometry.type === "MultiPolygon") {
//                 // Для MultiPolygon создаем несколько Polygon
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

//                   // Добавляем обработчик клика
//                   polygon.events.add('click', () => {
//                     const regionName = region.properties?.region;
//                     console.log('Клик по региону:', regionName);
//                     setSelectedRegion(regionName);
//                     if (onRegionClick) {
//                       onRegionClick(regionName);
//                     }
//                   });

//                   polygonsToAdd.push(polygon);
//                 });
//               } else if (region.geometry.type === "Polygon") {
//                 // Для Polygon создаем один Polygon
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

//                 // Добавляем обработчик клика
//                 polygon.events.add('click', () => {
//                   const regionName = region.properties?.region;
//                   console.log('Клик по региону:', regionName);
//                   setSelectedRegion(regionName);
//                   if (onRegionClick) {
//                     onRegionClick(regionName);
//                   }
//                 });

//                 polygonsToAdd.push(polygon);
//               }

//               // Добавляем полигоны на карту
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
//     if (ymaps) {
//       initializeMap(ymaps);
//     } else {
//       // Если ymaps еще не загружен, ждем события
//       window.addEventListener('loadYmaps', (event) => {
//         initializeMap(event.detail);
//       });

//       // Если событие уже было, но переменная не установлена
//       if (window.ymapsLoaded) {
//         initializeMap(window.ymaps);
//       }
//     }

//     // Очистка при размонтировании
//     return () => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.destroy();
//         mapInstanceRef.current = null;
//       }
//       polygonsRef.current.forEach(p => p.setParent(null));
//       polygonsRef.current = [];
//       pointsRef.current.forEach(p => p.setParent(null));
//       pointsRef.current = [];
//     };
//   }, [onRegionClick, selectedRegion]); // Убрали points из зависимостей

//   // Отдельный эффект для обновления точек
//   useEffect(() => {
//     if (!mapInstanceRef.current || !window.ymaps) return;

//     const ymaps = window.ymaps;
//     const map = mapInstanceRef.current;

//     // Очищаем старые точки
//     pointsRef.current.forEach(point => point.setParent(null));
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
//   }, [points]); // Только при изменении точек

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

// Точки рисовались норм

// import { useState, useEffect, useRef } from 'react';
// import regionsData from '../../russia_regions.geo.json';

// const MapComponent = ({ points = [], onRegionClick }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const mapContainerRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const polygonsRef = useRef([]); // Для хранения ссылок на полигоны
//   const pointsRef = useRef([]); // Для хранения ссылок на точки

//   useEffect(() => {
//     // Проверка корректности данных GeoJSON
//     if (!regionsData || !Array.isArray(regionsData.features)) {
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
//             center: [60, 100], // Центр России
//             zoom: 3,
//             controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
//           });
//           mapInstanceRef.current = map;
//         }

//         const map = mapInstanceRef.current;

//         // Очищаем предыдущие полигоны только при первой загрузке
//         if (polygonsRef.current.length === 0) {
//           // Добавление регионов
//           regionsData.features.forEach((region, index) => {
//             if (!region.geometry?.coordinates) {
//               return;
//             }

//             try {
//               let polygonsToAdd = [];

//               if (region.geometry.type === "MultiPolygon") {
//                 // Для MultiPolygon создаем несколько Polygon
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

//                   // Добавляем обработчик клика
//                   polygon.events.add('click', () => {
//                     const regionName = region.properties?.region;
//                     console.log('Клик по региону:', regionName);
//                     setSelectedRegion(regionName);
//                     if (onRegionClick) {
//                       onRegionClick(regionName);
//                     }
//                   });

//                   polygonsToAdd.push(polygon);
//                 });
//               } else if (region.geometry.type === "Polygon") {
//                 // Для Polygon создаем один Polygon
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

//                 // Добавляем обработчик клика
//                 polygon.events.add('click', () => {
//                   const regionName = region.properties?.region;
//                   console.log('Клик по региону:', regionName);
//                   setSelectedRegion(regionName);
//                   if (onRegionClick) {
//                     onRegionClick(regionName);
//                   }
//                 });

//                 polygonsToAdd.push(polygon);
//               }

//               // Добавляем полигоны на карту
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
//     if (ymaps) {
//       initializeMap(ymaps);
//     } else {
//       // Если ymaps еще не загружен, ждем события
//       window.addEventListener('loadYmaps', (event) => {
//         initializeMap(event.detail);
//       });

//       // Если событие уже было, но переменная не установлена
//       if (window.ymapsLoaded) {
//         initializeMap(window.ymaps);
//       }
//     }

//     // Очистка при размонтировании
//     return () => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.destroy();
//         mapInstanceRef.current = null;
//       }
//       polygonsRef.current.forEach(p => p.setParent(null));
//       polygonsRef.current = [];
//       pointsRef.current.forEach(p => p.setParent(null));
//       pointsRef.current = [];
//     };
//   }, [onRegionClick, selectedRegion]); // Убрали points из зависимостей

//   // Отдельный эффект для обновления точек
//   useEffect(() => {
//     if (!mapInstanceRef.current || !window.ymaps) return;

//     const ymaps = window.ymaps;
//     const map = mapInstanceRef.current;

//     // Очищаем старые точки
//     pointsRef.current.forEach(point => point.setParent(null));
//     pointsRef.current = [];

//     // Добавляем новые точки
//     points.forEach((point, idx) => {
//       // ИСПРАВЛЕНО: проверяем lat и lng (а не lon)
//       if (point.lat == null || point.lng == null) return;

//       try {
//         const placemark = new ymaps.Placemark(
//           [point.lat, point.lng], // ИСПРАВЛЕНО: используем lng
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
//   }, [points]); // Только при изменении точек

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

// import { useState, useEffect, useRef } from 'react';
// import regionsData from '../../russia_regions.geo.json';

// const MapComponent = ({ points = [], onRegionClick }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const mapContainerRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const polygonsRef = useRef([]); // Для хранения ссылок на полигоны

//   useEffect(() => {
//     // Проверка корректности данных GeoJSON
//     if (!regionsData || !Array.isArray(regionsData.features)) {
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
//         // Создаем карту
//         const map = new ymapsInstance.Map(mapContainerRef.current, {
//           center: [60, 100], // Центр России
//           zoom: 3,
//           controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
//         });

//         mapInstanceRef.current = map;

//         // Очищаем предыдущие полигоны
//         polygonsRef.current.forEach(p => p.setParent(null));
//         polygonsRef.current = [];

//         // Добавление регионов
//         regionsData.features.forEach((region, index) => {
//           if (!region.geometry?.coordinates) {
//             return;
//           }

//           try {
//             let polygonsToAdd = [];

//             if (region.geometry.type === "MultiPolygon") {
//               // Для MultiPolygon создаем несколько Polygon
//               region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
//                 const polygon = new ymapsInstance.Polygon(
//                    polygonCoords,
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

//                 // Добавляем обработчик клика
//                 polygon.events.add('click', () => {
//                   const regionName = region.properties?.region;
//                   console.log('Клик по региону:', regionName);
//                   setSelectedRegion(regionName);
//                   if (onRegionClick) {
//                     onRegionClick(regionName);
//                   }
//                 });

//                 polygonsToAdd.push(polygon);
//               });
//             } else if (region.geometry.type === "Polygon") {

//               // Для Polygon создаем один Polygon
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

//               // Добавляем обработчик клика
//               polygon.events.add('click', () => {
//                 const regionName = region.properties?.region;
//                 console.log('Клик по региону:', regionName);
//                 setSelectedRegion(regionName);
//                 if (onRegionClick) {
//                   onRegionClick(regionName);
//                 }
//               });

//               polygonsToAdd.push(polygon);
//             }

//             // Добавляем полигоны на карту
//             polygonsToAdd.forEach(polygon => {
//               map.geoObjects.add(polygon);
//               polygonsRef.current.push(polygon);
//             });

//           } catch (regionError) {
//             console.warn(`Ошибка добавления региона ${index}:`, regionError);
//           }
//         });

//         // Добавление точек
//         points.forEach((point, idx) => {
//           if (point.lat == null || point.lon == null) return;

//           try {
//             const placemark = new ymapsInstance.Placemark(
//               [point.lat, point.lon], // Проверьте порядок координат!
//               {
//                 hintContent: point.name || `Точка ${idx}`,
//               },
//               {
//                 preset: 'islands#redCircleIcon'
//               }
//             );
//             map.geoObjects.add(placemark);
//           } catch (pointError) {
//             console.warn(`Ошибка добавления точки ${idx}:`, pointError);
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
//     if (ymaps) {
//       initializeMap(ymaps);
//     } else {
//       // Если ymaps еще не загружен, ждем события
//       window.addEventListener('loadYmaps', (event) => {
//         initializeMap(event.detail);
//       });

//       // Если событие уже было, но переменная не установлена
//       if (window.ymapsLoaded) {
//         initializeMap(window.ymaps);
//       }
//     }

//     // Очистка при размонтировании
//     return () => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.destroy();
//         mapInstanceRef.current = null;
//       }
//       polygonsRef.current.forEach(p => p.setParent(null));
//       polygonsRef.current = [];
//     };
//   }, [points, onRegionClick, selectedRegion]); // Добавили selectedRegion в зависимости

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
