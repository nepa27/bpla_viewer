import { useEffect, useMemo, useRef } from 'react';

import { useLocation } from 'react-router';

export const useMapPolygons = ({ mapInstance, ymapsReady, regionsData, onRegionClick }) => {
  const polygonsRef = useRef([]);
  const location = useLocation();

  // Определяем выбранный регион из состояния навигации
  const selectedRegion = location.state?.region || null;

  // Мемоизируем ключ регионов для избежания перерисовки при изменении selectedRegion
  // Работает как с FeatureCollection (множество регионов), так и с одним Feature (один регион)
  const regionsKey = useMemo(() => {
    if (!regionsData) return '';

    // Проверяем, является ли regionsData FeatureCollection или одним Feature
    const features =
      regionsData.type === 'FeatureCollection' ? regionsData.features : [regionsData];

    return (
      features
        ?.map(
          (region, index) =>
            `${region.properties?.region_id || region.properties?.region || index}-${region.geometry?.type || 'unknown'}`,
        )
        .join('|') || ''
    );
  }, [regionsData]);

  useEffect(() => {
    if (!mapInstance || !ymapsReady || !regionsData) return;

    // Очищаем предыдущие полигоны
    polygonsRef.current.forEach((p) => {
      if (p.setParent) p.setParent(null);
    });
    polygonsRef.current = [];

    // Определяем массив регионов для обработки
    const features =
      regionsData.type === 'FeatureCollection' ? regionsData.features : [regionsData];

    // Добавление регионов
    features.forEach((region, index) => {
      if (!region.geometry?.coordinates) {
        return;
      }

      try {
        let polygonsToAdd = [];

        if (region.geometry.type === 'MultiPolygon') {
          region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
            const polygon = new window.ymaps.Polygon(
              polygonCoords,
              {
                name: region.properties?.region || `Регион ${index}-${polyIndex}`,
                hintContent: region.properties?.region || `Регион ${index}-${polyIndex}`,
                // Передаем region_id в свойства полигона для использования в onRegionClick
                regionId: region.properties?.region_id,
              },
              {
                fillColor:
                  selectedRegion?.properties?.region === region.properties?.region
                    ? '#ff444499'
                    : '#4488ff99',
                strokeColor: '#000000',
                strokeWidth:
                  selectedRegion?.properties?.region === region.properties?.region ? 2 : 1,
                opacity: 0.7,
                cursor: 'pointer',
              },
            );

            polygon.events.add('click', () => {
              // Передаем весь объект региона в onRegionClick
              onRegionClick?.(region);
            });

            polygonsToAdd.push(polygon);
          });
        } else if (region.geometry.type === 'Polygon') {
          const polygon = new window.ymaps.Polygon(
            region.geometry.coordinates,
            {
              name: region.properties?.region || `Регион ${index}`,
              hintContent: region.properties?.region || `Регион ${index}`,
              regionId: region.properties?.region_id,
            },
            {
              fillColor:
                selectedRegion?.properties?.region === region.properties?.region
                  ? '#ff444499'
                  : '#4488ff99',
              strokeColor: '#000000',
              strokeWidth: selectedRegion?.properties?.region === region.properties?.region ? 2 : 1,
              opacity: 0.7,
              cursor: 'pointer',
            },
          );

          polygon.events.add('click', () => {
            onRegionClick?.(region);
          });

          polygonsToAdd.push(polygon);
        }

        polygonsToAdd.forEach((polygon) => {
          mapInstance.geoObjects.add(polygon);
          polygonsRef.current.push(polygon);
        });
      } catch (regionError) {
        console.warn(`Ошибка добавления региона ${index}:`, regionError);
      }
    });

    // Очистка при изменении данных регионов
    return () => {
      polygonsRef.current.forEach((p) => {
        if (p.setParent) p.setParent(null);
      });
      polygonsRef.current = [];
    };
  }, [mapInstance, ymapsReady, regionsKey, onRegionClick, selectedRegion, regionsData]);

  // Отдельный эффект для обновления стилей при изменении selectedRegion
  useEffect(() => {
    // Обновляем стили полигонов при изменении selectedRegion
    polygonsRef.current.forEach((polygon) => {
      try {
        const polygonName = polygon.properties.get('name');
        const isSelected = selectedRegion?.properties?.region === polygonName;

        polygon.options.set({
          fillColor: isSelected ? '#ff444499' : '#4488ff99',
          strokeWidth: isSelected ? 2 : 1,
        });
      } catch (e) {
        console.warn('Ошибка обновления стиля полигона:', e);
      }
    });
  }, [selectedRegion]); // Зависимость только от selectedRegion

  return polygonsRef;
};

// import { useEffect, useRef, useMemo } from 'react';

// export const useMapPolygons = ({
//   mapInstance,
//   ymapsReady,
//   regionsData,
//   selectedRegion,
//   onRegionClick
// }) => {
//   const polygonsRef = useRef([]);

//   // Мемоизируем ключ регионов чтобы избежать перерисовки при изменении selectedRegion
//   const regionsKey = useMemo(() => {
//     return regionsData?.features?.map((region, index) =>
//       `${region.properties?.region || index}-${region.geometry?.type || 'unknown'}`
//     ).join('|') || '';
//   }, [regionsData]);

//   useEffect(() => {
//     if (!mapInstance || !ymapsReady || !regionsData?.features) return;

//     // Очищаем предыдущие полигоны только при изменении данных регионов
//     polygonsRef.current.forEach(p => {
//       if (p.setParent) p.setParent(null);
//     });
//     polygonsRef.current = [];

//     // Добавление регионов
//     regionsData.features.forEach((region, index) => {
//       if (!region.geometry?.coordinates) {
//         return;
//       }

//       try {
//         let polygonsToAdd = [];

//         if (region.geometry.type === "MultiPolygon") {
//           region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
//             const polygon = new window.ymaps.Polygon(
//               polygonCoords,
//               {
//                 name: region.properties?.region || `Регион ${index}-${polyIndex}`,
//                 hintContent: region.properties?.region || `Регион ${index}-${polyIndex}`,
//               },
//               {
//                 fillColor: selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
//                 strokeColor: '#000000',
//                 strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
//                 opacity: 0.7,
//                 cursor: 'pointer'
//               }
//             );

//             polygon.events.add('click', () => {
//               const regionName = region.properties?.region;
//               onRegionClick?.(regionName);
//             });

//             polygonsToAdd.push(polygon);
//           });
//         } else if (region.geometry.type === "Polygon") {
//           const polygon = new window.ymaps.Polygon(
//             region.geometry.coordinates,
//             {
//               name: region.properties?.region || `Регион ${index}`,
//               hintContent: region.properties?.region || `Регион ${index}`,
//             },
//             {
//               fillColor: selectedRegion === region.properties?.region ? '#ff444499' : '#4488ff99',
//               strokeColor: '#000000',
//               strokeWidth: selectedRegion === region.properties?.region ? 2 : 1,
//               opacity: 0.7,
//               cursor: 'pointer'
//             }
//           );

//           polygon.events.add('click', () => {
//             const regionName = region.properties?.region;
//             onRegionClick?.(regionName);
//           });

//           polygonsToAdd.push(polygon);
//         }

//         polygonsToAdd.forEach(polygon => {
//           mapInstance.geoObjects.add(polygon);
//           polygonsRef.current.push(polygon);
//         });

//       } catch (regionError) {
//         console.warn(`Ошибка добавления региона ${index}:`, regionError);
//       }
//     });

//     // Очистка при изменении данных регионов
//     return () => {
//       polygonsRef.current.forEach(p => {
//         if (p.setParent) p.setParent(null);
//       });
//       polygonsRef.current = [];
//     };
//   }, [mapInstance, ymapsReady, regionsKey, onRegionClick]); // Используем regionsKey вместо selectedRegion

//   // Отдельный эффект для обновления стилей при изменении selectedRegion
//   useEffect(() => {
//     // Здесь можно обновить стили полигонов без пересоздания
//   }, [selectedRegion]);

//   return polygonsRef;
// };

// import { useEffect, useRef } from 'react';

// export const useMapPolygons = ({
//   mapInstance,
//   ymapsReady,
//   regionsData,
//   selectedRegion,
//   onRegionClick,
//   mapLoadError = false
// }) => {
//   const polygonsRef = useRef([]);
//   const svgContainerRef = useRef(null);

//   useEffect(() => {
//     // Всегда пытаемся отобразить полигоны
//     if (!regionsData?.features) {
//       return;
//     }

//     // Если карта загружена и API доступно, отображаем полигоны на карте
//     if (mapInstance && ymapsReady && window.ymaps?.Polygon) {
//       try {
//         // Очищаем предыдущие полигоны
//         polygonsRef.current.forEach(p => {
//           try {
//             if (p.getParent && p.getParent()) {
//               mapInstance.geoObjects.remove(p);
//             }
//           } catch (e) {
//             // Игнорируем ошибки очистки
//           }
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
//                 const polygon = new window.ymaps.Polygon(
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
//                   onRegionClick?.(regionName);
//                 });

//                 polygonsToAdd.push(polygon);
//               });
//             } else if (region.geometry.type === "Polygon") {
//               const polygon = new window.ymaps.Polygon(
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
//                 onRegionClick?.(regionName);
//               });

//               polygonsToAdd.push(polygon);
//             }

//             polygonsToAdd.forEach(polygon => {
//               try {
//                 if (mapInstance && mapInstance.geoObjects) {
//                   mapInstance.geoObjects.add(polygon);
//                   polygonsRef.current.push(polygon);
//                 }
//               } catch (e) {
//                 // Игнорируем ошибки добавления
//               }
//             });

//           } catch (regionError) {
//             // Игнорируем ошибки создания полигонов
//           }
//         });
//       } catch (error) {
//         // Игнорируем общие ошибки
//       }
//     }

//     // Очистка при изменении зависимостей
//     return () => {
//       try {
//         polygonsRef.current.forEach(p => {
//           try {
//             if (mapInstance && mapInstance.geoObjects && p.getParent && p.getParent()) {
//               mapInstance.geoObjects.remove(p);
//             }
//           } catch (e) {
//             // Игнорируем ошибки очистки
//           }
//         });
//         polygonsRef.current = [];
//       } catch (e) {
//         // Игнорируем общие ошибки очистки
//       }
//     };
//   }, [mapInstance, ymapsReady, onRegionClick, regionsData, selectedRegion, mapLoadError]);

//   return polygonsRef;
// };
