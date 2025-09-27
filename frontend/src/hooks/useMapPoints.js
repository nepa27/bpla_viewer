// hooks/useMapPoints.js
import { useEffect, useRef } from 'react';
import { hasDataChanged } from './utils/hashUtils';
import { updateMapPoints } from './utils/mapPointsProcessor';
import { getClusterHash } from './utils/hashUtils';

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
// // hooks/useMapPoints.js
// import { useCallback, useEffect, useRef } from 'react';

// export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
//   const pointsRef = useRef([]);
//   const clustererRef = useRef(null);
//   const lastZoomRef = useRef(3);
//   const processingTimeoutRef = useRef(null);

//   // Оптимизированная функция кластеризации для больших объемов данных
//   const clusterPoints = useCallback((pointsArray, zoomLevel = 3) => {
//     if (!pointsArray || pointsArray.length === 0) return [];

//     // Быстрая проверка на размер
//     if (pointsArray.length > 100000) {
//       // Для очень больших объемов используем упрощенную кластеризацию
//       return clusterPointsFast(pointsArray, zoomLevel);
//     }

//     // Стандартная кластеризация для средних объемов
//     return clusterPointsStandard(pointsArray, zoomLevel);
//   }, []);

//   // Быстрая кластеризация для больших объемов
//   const clusterPointsFast = useCallback((pointsArray, zoomLevel) => {
//     const clusters = new Map();
//     const gridSize = Math.max(1, Math.min(100, 12 - zoomLevel));

//     // Используем быстрые операции без лишних вычислений
//     for (let i = 0; i < pointsArray.length; i++) {
//       const point = pointsArray[i];
//       if (point.lat == null || point.lng == null) continue;

//       // Быстрое округление без лишних операций
//       const latKey = Math.round(point.lat * gridSize * 10) / (gridSize * 10);
//       const lngKey = Math.round(point.lng * gridSize * 10) / (gridSize * 10);
//       const key = `${latKey}_${lngKey}`;

//       if (!clusters.has(key)) {
//         clusters.set(key, {
//           lat: latKey,
//           lng: lngKey,
//           count: 0,
//           points: [],
//         });
//       }

//       const cluster = clusters.get(key);
//       cluster.count++;
//       cluster.points.push(point);
//     }

//     // Быстрое преобразование в массив
//     const result = [];
//     for (const cluster of clusters.values()) {
//       if (cluster.count > 0) {
//         result.push({
//           lat: cluster.lat,
//           lng: cluster.lng,
//           count: cluster.count,
//           isCluster: cluster.count > 1,
//           points: cluster.points,
//         });
//       }
//     }

//     return result;
//   }, []);

//   // Стандартная кластеризация
//   const clusterPointsStandard = useCallback((pointsArray, zoomLevel) => {
//     const clusters = new Map();
//     const gridSize = Math.max(1, 12 - zoomLevel);

//     // Быстрая обработка с минимумом операций
//     for (let i = 0; i < pointsArray.length; i++) {
//       const point = pointsArray[i];
//       if (point.lat == null || point.lng == null) continue;

//       // Быстрое округление
//       const latKey = Math.round(point.lat * gridSize * 100) / (gridSize * 100);
//       const lngKey = Math.round(point.lng * gridSize * 100) / (gridSize * 100);
//       const key = `${latKey}_${lngKey}`;

//       if (!clusters.has(key)) {
//         clusters.set(key, {
//           lat: latKey,
//           lng: lngKey,
//           count: 0,
//           points: [],
//         });
//       }

//       const cluster = clusters.get(key);
//       cluster.count++;
//       cluster.points.push(point);
//     }

//     // Быстрое преобразование и фильтрация
//     const result = [];
//     for (const cluster of clusters.values()) {
//       if (cluster.count > 0) {
//         result.push({
//           lat: cluster.lat,
//           lng: cluster.lng,
//           count: cluster.count,
//           isCluster: cluster.count > 1,
//           points: cluster.points,
//         });
//       }
//     }

//     return result;
//   }, []);

//   // Быстрая функция для создания хэша кластеров
//   const getClusterHash = useCallback((clusters) => {
//     if (!clusters || clusters.length === 0) return '';

//     // Быстрая генерация хэша без сортировки
//     const keys = [];
//     const maxItems = Math.min(clusters.length, 1000);

//     for (let i = 0; i < maxItems; i++) {
//       const cluster = clusters[i];
//       keys.push(
//         `${Math.round(cluster.lat * 100)}_${Math.round(cluster.lng * 100)}_${cluster.count}`,
//       );
//     }

//     // Быстрая конкатенация без сортировки
//     return keys.join('|');
//   }, []);

//   // Быстрая проверка изменения данных
//   const hasDataChanged = useCallback((oldPoints, newPoints) => {
//     if (!oldPoints || !newPoints) return oldPoints !== newPoints;
//     if (oldPoints.length !== newPoints.length) return true;

//     // Быстрая проверка первых элементов
//     const checkCount = Math.min(oldPoints.length, 100);
//     for (let i = 0; i < checkCount; i++) {
//       if (oldPoints[i]?.id !== newPoints[i]?.id) return true;
//     }

//     return false;
//   }, []);

//   // Быстрая обработка данных
//   const processPoints = useCallback(
//     (pointsArray, zoomLevel) => {
//       if (!pointsArray || pointsArray.length === 0) return [];

//       // Быстрая кластеризация с оптимизацией
//       const clustered = clusterPoints(pointsArray, zoomLevel);

//       // Быстрый подсчет общего количества точек
//       const totalCount = clustered.reduce((sum, cluster) => sum + cluster.count, 0);

//       console.log(
//         `Кластеризовано ${pointsArray.length} точек -> ${clustered.length} кластеров (${totalCount} полетов)`,
//       );

//       return clustered;
//     },
//     [clusterPoints],
//   );

//   useEffect(() => {
//     if (!mapInstance || !ymapsReady || !points) return;

//     const processClusters = () => {
//       // Быстрая проверка на изменение данных
//       if (pointsRef.current.length > 0 && !hasDataChanged(pointsRef.current, points)) {
//         return;
//       }

//       // Быстрое получение текущего zoom
//       const zoom = mapInstance.getZoom();
//       lastZoomRef.current = zoom;

//       // Быстрая обработка кластеров
//       const clusteredPoints = processPoints(points, zoom);

//       // Быстрое создание хэша
//       const newHash = getClusterHash(clusteredPoints);
//       const currentHash = pointsRef.current.hash || '';

//       if (currentHash === newHash && pointsRef.current.length > 0) {
//         return;
//       }

//       // Быстрая очистка старых кластеров
//       try {
//         if (clustererRef.current && mapInstance.geoObjects) {
//           mapInstance.geoObjects.remove(clustererRef.current);
//         }
//       } catch (e) {
//         // Игнорируем ошибки очистки
//       }

//       // Быстрое создание нового кластеризатора
//       const clusterer = new window.ymaps.Clusterer({
//         gridSize: 64,
//         clusterDisableClickZoom: false,
//         clusterOpenBalloonOnClick: true,
//         clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//         clusterBalloonPanelMaxMapArea: 0,
//         clusterBalloonContentLayoutWidth: 200,
//         clusterBalloonContentLayoutHeight: 150,
//       });

//       // Быстрая обработка точек
//       const geoObjects = [];

//       // Быстрая обработка кластеров без лишних операций
//       for (let i = 0; i < clusteredPoints.length; i++) {
//         const cluster = clusteredPoints[i];
//         if (!cluster) continue;

//         if (!cluster.isCluster) {
//           // Быстрая обработка одиночной точки
//           const point = cluster.points[0];
//           const placemark = new window.ymaps.Placemark(
//             [cluster.lat, cluster.lng],
//             {
//               hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//               balloonContent: `
//                 <div style="max-width: 300px;">
//                   <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                   <table style="width: 100%; border-collapse: collapse;">
//                     <tr>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 5px;"><b>Регион:</b></td>
//                       <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                     </tr>
//                   </table>
//                 </div>
//               `,
//             },
//             {
//               preset: 'islands#dotIcon',
//               iconColor: '#e74c3c',
//             },
//           );
//           geoObjects.push(placemark);
//         } else {
//           // Быстрая обработка кластера
//           const flightsByDate = {};

//           // Быстрая группировка по датам
//           for (let j = 0; j < cluster.points.length; j++) {
//             const point = cluster.points[j];
//             const date = point.date || 'Не указана';

//             if (!flightsByDate[date]) {
//               flightsByDate[date] = {
//                 flights: [],
//                 count: 0,
//               };
//             }
//             flightsByDate[date].flights.push({
//               id: point.id || 'Не указан',
//               type: point.type || 'Не указан',
//               region: point.region || 'Не определен',
//             });
//             flightsByDate[date].count++;
//           }

//           // Быстрое формирование списка полетов по датам
//           let flightsByDateList = '';
//           const dates = Object.keys(flightsByDate).slice(0, 15);

//           for (let k = 0; k < dates.length; k++) {
//             const date = dates[k];
//             const dateInfo = flightsByDate[date];
//             const flights = dateInfo.flights.slice(0, 10);

//             flightsByDateList += `
//               <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//                 <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                   ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//                 </div>
//                 <div style="max-height: 120px; overflow-y: auto;">
//                   <table style="width: 100%; font-size: 12px;">
//                     <thead>
//                       <tr style="background: #eee;">
//                         <th style="padding: 4px; text-align: left;">ID полета</th>
//                         <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                         <th style="padding: 4px; text-align: left;">Регион</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//             `;

//             for (let l = 0; l < flights.length; l++) {
//               const flight = flights[l];
//               flightsByDateList += `
//                 <tr>
//                   <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                   <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                   <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//                 </tr>
//               `;
//             }

//             flightsByDateList += `
//                     </tbody>
//                   </table>
//             `;

//             if (dateInfo.flights.length > 10) {
//               flightsByDateList += `
//                 <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                   и еще ${dateInfo.flights.length - 10} полетов...
//                 </div>
//               `;
//             }

//             flightsByDateList += `
//                 </div>
//               </div>
//             `;
//           }

//           if (Object.keys(flightsByDate).length > 15) {
//             flightsByDateList += `
//               <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//                 и еще ${Object.keys(flightsByDate).length - 15} дат...
//               </div>
//             `;
//           }

//           // Быстрое создание кластерной метки
//           const clusterPlacemark = new window.ymaps.Placemark(
//             [cluster.lat, cluster.lng],
//             {
//               hintContent: `Группа полетов: ${cluster.count}`,
//               balloonContent: `
//                 <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                   <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                   <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                     <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                     <div style="color: #666;">полетов в этой группе</div>
//                     <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                       Группировка по близким координатам взлета
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                       Полеты по датам:
//                     </h4>
//                     ${flightsByDateList}
//                   </div>
//                 </div>
//               `,
//             },
//             {
//               iconLayout: 'default#imageWithContent',
//               iconImageHref:
//                 'data:image/svg+xml;charset=utf-8,' +
//                 encodeURIComponent(
//                   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                     `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                     `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                     `</svg>`,
//                 ),
//               iconImageSize: [30, 30],
//               iconImageOffset: [-15, -15],
//             },
//           );
//           geoObjects.push(clusterPlacemark);
//         }
//       }

//       // Быстрое добавление объектов
//       clusterer.add(geoObjects);
//       mapInstance.geoObjects.add(clusterer);

//       // Быстрое сохранение ссылок
//       clustererRef.current = clusterer;
//       pointsRef.current = clusteredPoints;
//       pointsRef.current.hash = newHash;
//     };

//     // Быстрая обработка без задержек
//     processClusters();

//     // Быстрый обработчик изменения zoom
//     const handleZoomChange = () => {
//       // Быстрое обновление без задержек
//       const newZoom = mapInstance.getZoom();
//       lastZoomRef.current = newZoom;

//       // Используем setTimeout для предотвращения блокировки UI
//       if (processingTimeoutRef.current) {
//         clearTimeout(processingTimeoutRef.current);
//       }

//       processingTimeoutRef.current = setTimeout(() => {
//         const newClusteredPoints = processPoints(points, newZoom);
//         const newHash = getClusterHash(newClusteredPoints);

//         if (newHash !== pointsRef.current.hash) {
//           try {
//             if (clustererRef.current && mapInstance.geoObjects) {
//               mapInstance.geoObjects.remove(clustererRef.current);
//             }
//           } catch (e) {
//             // Игнорируем ошибки очистки
//           }

//           const newClusterer = new window.ymaps.Clusterer({
//             gridSize: 64,
//             clusterDisableClickZoom: false,
//             clusterOpenBalloonOnClick: true,
//             clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//             clusterBalloonPanelMaxMapArea: 0,
//             clusterBalloonContentLayoutWidth: 200,
//             clusterBalloonContentLayoutHeight: 150,
//           });

//           const newGeoObjects = [];

//           for (let i = 0; i < newClusteredPoints.length; i++) {
//             const cluster = newClusteredPoints[i];
//             if (!cluster) continue;

//             if (!cluster.isCluster) {
//               const point = cluster.points[0];
//               const placemark = new window.ymaps.Placemark(
//                 [cluster.lat, cluster.lng],
//                 {
//                   hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//                   balloonContent: `
//                     <div style="max-width: 300px;">
//                       <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                       <table style="width: 100%; border-collapse: collapse;">
//                         <tr>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 5px;"><b>Регион:</b></td>
//                           <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                         </tr>
//                       </table>
//                     </div>
//                   `,
//                 },
//                 {
//                   preset: 'islands#dotIcon',
//                   iconColor: '#e74c3c',
//                 },
//               );
//               newGeoObjects.push(placemark);
//             } else {
//               // Быстрая обработка кластера
//               const flightsByDate = {};

//               for (let j = 0; j < cluster.points.length; j++) {
//                 const point = cluster.points[j];
//                 const date = point.date || 'Не указана';

//                 if (!flightsByDate[date]) {
//                   flightsByDate[date] = {
//                     flights: [],
//                     count: 0,
//                   };
//                 }
//                 flightsByDate[date].flights.push({
//                   id: point.id || 'Не указан',
//                   type: point.type || 'Не указан',
//                   region: point.region || 'Не определен',
//                 });
//                 flightsByDate[date].count++;
//               }

//               let flightsByDateList = '';
//               const dates = Object.keys(flightsByDate).slice(0, 15);

//               for (let k = 0; k < dates.length; k++) {
//                 const date = dates[k];
//                 const dateInfo = flightsByDate[date];
//                 const flights = dateInfo.flights.slice(0, 10);

//                 flightsByDateList += `
//                   <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//                     <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                       ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//                     </div>
//                     <div style="max-height: 120px; overflow-y: auto;">
//                       <table style="width: 100%; font-size: 12px;">
//                         <thead>
//                           <tr style="background: #eee;">
//                             <th style="padding: 4px; text-align: left;">ID полета</th>
//                             <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                             <th style="padding: 4px; text-align: left;">Регион</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                 `;

//                 for (let l = 0; l < flights.length; l++) {
//                   const flight = flights[l];
//                   flightsByDateList += `
//                     <tr>
//                       <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                       <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                       <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//                     </tr>
//                   `;
//                 }

//                 flightsByDateList += `
//                         </tbody>
//                       </table>
//                 `;

//                 if (dateInfo.flights.length > 10) {
//                   flightsByDateList += `
//                     <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                       и еще ${dateInfo.flights.length - 10} полетов...
//                     </div>
//                   `;
//                 }

//                 flightsByDateList += `
//                     </div>
//                   </div>
//                 `;
//               }

//               if (Object.keys(flightsByDate).length > 15) {
//                 flightsByDateList += `
//                   <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//                     и еще ${Object.keys(flightsByDate).length - 15} дат...
//                   </div>
//                 `;
//               }

//               const clusterPlacemark = new window.ymaps.Placemark(
//                 [cluster.lat, cluster.lng],
//                 {
//                   hintContent: `Группа полетов: ${cluster.count}`,
//                   balloonContent: `
//                     <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                       <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                       <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                         <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                         <div style="color: #666;">полетов в этой группе</div>
//                         <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                           Группировка по близким координатам взлета
//                         </div>
//                       </div>
                      
//                       <div>
//                         <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                           Полеты по датам:
//                         </h4>
//                         ${flightsByDateList}
//                       </div>
//                     </div>
//                   `,
//                 },
//                 {
//                   iconLayout: 'default#imageWithContent',
//                   iconImageHref:
//                     'image/svg+xml;charset=utf-8,' +
//                     encodeURIComponent(
//                       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                         `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                         `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                         `</svg>`,
//                     ),
//                   iconImageSize: [30, 30],
//                   iconImageOffset: [-15, -15],
//                 },
//               );
//               newGeoObjects.push(clusterPlacemark);
//             }
//           }

//           newClusterer.add(newGeoObjects);
//           mapInstance.geoObjects.add(newClusterer);

//           clustererRef.current = newClusterer;
//           pointsRef.current = newClusteredPoints;
//           pointsRef.current.hash = newHash;
//         }
//       }, 0);
//     };

//     mapInstance.events.add('zoomchange', handleZoomChange);

//     return () => {
//       mapInstance.events.remove('zoomchange', handleZoomChange);

//       if (processingTimeoutRef.current) {
//         clearTimeout(processingTimeoutRef.current);
//       }

//       try {
//         if (clustererRef.current && mapInstance.geoObjects) {
//           mapInstance.geoObjects.remove(clustererRef.current);
//         }
//       } catch (e) {
//         // Игнорируем ошибки очистки
//       }
//       pointsRef.current = [];
//       clustererRef.current = null;
//     };
//   }, [mapInstance, ymapsReady, points, processPoints, getClusterHash, hasDataChanged]);

//   return pointsRef;
// };

// // hooks/useMapPoints.js
// import { useCallback, useEffect, useRef } from 'react';

// export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
//   const pointsRef = useRef([]);
//   const clustererRef = useRef(null);
//   const lastZoomRef = useRef(3);

//   // Оптимизированная функция кластеризации для больших объемов данных
//   const clusterPoints = useCallback((pointsArray, zoomLevel = 3) => {
//     if (!pointsArray || pointsArray.length === 0) return [];

//     console.log('Количество точек для кластеризации:', pointsArray.length);

//     // При высоком zoom уровне отключаем кластеризацию
//     if (zoomLevel >= 10) {
//       return pointsArray.map((point) => ({
//         lat: point.lat,
//         lng: point.lng,
//         count: 1,
//         isCluster: false,
//         points: [point],
//       }));
//     }

//     // Оптимизированная кластеризация с использованием Map для лучшей производительности
//     const clusters = new Map();

//     // Увеличиваем gridSize для больших объемов данных
//     const gridSize = Math.max(1, Math.min(100, 12 - zoomLevel)); // Ограничение gridSize

//     // Для оптимизации больших наборов данных используем бинарное разбиение
//     if (pointsArray.length > 10000) {
//       // Используем более грубую сетку для больших объемов
//       const coarseGridSize = Math.max(1, Math.ceil(gridSize * 2));

//       for (let i = 0; i < pointsArray.length; i++) {
//         const point = pointsArray[i];
//         if (point.lat == null || point.lng == null) continue;

//         // Более грубое округление для больших наборов
//         const latKey = Math.round(point.lat * coarseGridSize) / coarseGridSize;
//         const lngKey = Math.round(point.lng * coarseGridSize) / coarseGridSize;
//         const key = `${latKey}_${lngKey}`;

//         if (!clusters.has(key)) {
//           clusters.set(key, {
//             lat: latKey,
//             lng: lngKey,
//             count: 0,
//             points: [],
//           });
//         }

//         const cluster = clusters.get(key);
//         cluster.count++;
//         cluster.points.push(point);
//       }
//     } else {
//       // Стандартная кластеризация для меньших объемов
//       for (let i = 0; i < pointsArray.length; i++) {
//         const point = pointsArray[i];
//         if (point.lat == null || point.lng == null) continue;

//         // Точное округление для меньших объемов
//         const latKey = Math.round(point.lat * gridSize * 100) / (gridSize * 100);
//         const lngKey = Math.round(point.lng * gridSize * 100) / (gridSize * 100);
//         const key = `${latKey}_${lngKey}`;

//         if (!clusters.has(key)) {
//           clusters.set(key, {
//             lat: latKey,
//             lng: lngKey,
//             count: 0,
//             points: [],
//           });
//         }

//         const cluster = clusters.get(key);
//         cluster.count++;
//         cluster.points.push(point);
//       }
//     }

//     // Преобразуем в массив и фильтруем кластеры с данными
//     const result = Array.from(clusters.values())
//       .filter((cluster) => cluster.count > 0)
//       .map((cluster) => ({
//         lat: cluster.lat,
//         lng: cluster.lng,
//         count: cluster.count,
//         isCluster: cluster.count > 1,
//         points: cluster.points,
//       }));

//     console.log(
//       `Создано кластеров: ${result.length}, общее количество точек: ${pointsArray.length}`,
//     );
//     return result;
//   }, []);

//   // Функция для создания хэша кластеров с оптимизацией
//   const getClusterHash = useCallback((clusters) => {
//     if (!clusters || clusters.length === 0) return '';

//     // Для больших объемов используем упрощенный хэш
//     if (clusters.length > 10000) {
//       // Берем только несколько ключей для быстрого сравнения
//       const sampleKeys = [];
//       const step = Math.max(1, Math.floor(clusters.length / 100)); // Берем 100 случайных элементов

//       for (let i = 0; i < clusters.length; i += step) {
//         const cluster = clusters[i];
//         sampleKeys.push(
//           `${Math.round(cluster.lat * 100)}-${Math.round(cluster.lng * 100)}-${cluster.count}`,
//         );
//       }

//       return sampleKeys.sort().join('|');
//     }

//     // Для малых объемов стандартный подход
//     const keys = [];
//     for (let i = 0; i < Math.min(clusters.length, 1000); i++) {
//       const cluster = clusters[i];
//       keys.push(
//         `${Math.round(cluster.lat * 1000)}-${Math.round(cluster.lng * 1000)}-${cluster.count}`,
//       );
//     }
//     return keys.sort().join('|');
//   }, []);

//   // Оптимизированная функция обновления кластеров
//   const updateClusters = useCallback(
//     (pointsArray, zoomLevel) => {
//       if (!pointsArray || pointsArray.length === 0) return [];

//       // Для очень больших объемов данных используем специальную стратегию
//       if (pointsArray.length > 50000) {
//         const clustered = clusterPoints(pointsArray, zoomLevel);
//         console.log(
//           `Обработано ${pointsArray.length} точек, создано ${clustered.length} кластеров`,
//         );
//         return clustered;
//       }

//       return clusterPoints(pointsArray, zoomLevel);
//     },
//     [clusterPoints],
//   );

//   useEffect(() => {
//     if (!mapInstance || !ymapsReady || !points) return;

//     // Получаем текущий zoom level для кластеризации
//     const zoom = mapInstance.getZoom();
//     lastZoomRef.current = zoom;

//     const clusteredPoints = updateClusters(points, zoom);

//     // Проверяем, изменились ли кластеры
//     const newHash = getClusterHash(clusteredPoints);
//     const currentHash = pointsRef.current.hash || '';

//     if (currentHash === newHash && pointsRef.current.length > 0) {
//       return;
//     }

//     // Очищаем старые точки
//     try {
//       if (clustererRef.current && mapInstance.geoObjects) {
//         mapInstance.geoObjects.remove(clustererRef.current);
//       }
//     } catch (e) {
//       // Игнорируем ошибки очистки
//     }

//     // Создаем новый кластеризатор
//     const clusterer = new window.ymaps.Clusterer({
//       gridSize: 64,
//       clusterDisableClickZoom: false,
//       clusterOpenBalloonOnClick: true,
//       clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//       clusterBalloonPanelMaxMapArea: 0,
//       clusterBalloonContentLayoutWidth: 200,
//       clusterBalloonContentLayoutHeight: 150,
//     });

//     // Создаем метки для кластеров
//     const geoObjects = [];

//     // Оптимизация для больших объемов данных
//     const processBatch = (startIndex, endIndex, batchSize = 1000) => {
//       if (startIndex >= endIndex) return Promise.resolve();

//       const batchEnd = Math.min(startIndex + batchSize, endIndex);
//       for (let i = startIndex; i < batchEnd; i++) {
//         const cluster = clusteredPoints[i];
//         if (!cluster) continue;

//         if (!cluster.isCluster) {
//           // Одиночная точка
//           const point = cluster.points[0];
//           const placemark = new window.ymaps.Placemark(
//             [cluster.lat, cluster.lng],
//             {
//               hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//               balloonContent: `
//                 <div style="max-width: 300px;">
//                   <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                   <table style="width: 100%; border-collapse: collapse;">
//                     <tr>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                       <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 5px;"><b>Регион:</b></td>
//                       <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                     </tr>
//                   </table>
//                 </div>
//               `,
//             },
//             {
//               preset: 'islands#dotIcon',
//               iconColor: '#e74c3c',
//             },
//           );
//           geoObjects.push(placemark);
//         } else {
//           // Кластер
//           const flightsByDate = {};
//           cluster.points.forEach((point) => {
//             const date = point.date || 'Не указана';
//             if (!flightsByDate[date]) {
//               flightsByDate[date] = {
//                 flights: [],
//                 count: 0,
//               };
//             }
//             flightsByDate[date].flights.push({
//               id: point.id || 'Не указан',
//               type: point.type || 'Не указан',
//               region: point.region || 'Не определен',
//             });
//             flightsByDate[date].count++;
//           });

//           // Формируем структурированный список по датам
//           let flightsByDateList = '';
//           const dates = Object.keys(flightsByDate).slice(0, 15);

//           dates.forEach((date) => {
//             const dateInfo = flightsByDate[date];
//             const flights = dateInfo.flights.slice(0, 10);

//             flightsByDateList += `
//               <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//                 <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                   ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//                 </div>
//                 <div style="max-height: 120px; overflow-y: auto;">
//                   <table style="width: 100%; font-size: 12px;">
//                     <thead>
//                       <tr style="background: #eee;">
//                         <th style="padding: 4px; text-align: left;">ID полета</th>
//                         <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                         <th style="padding: 4px; text-align: left;">Регион</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//             `;

//             flights.forEach((flight) => {
//               flightsByDateList += `
//                 <tr>
//                   <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                   <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                   <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//                 </tr>
//               `;
//             });

//             flightsByDateList += `
//                     </tbody>
//                   </table>
//             `;

//             if (dateInfo.flights.length > 10) {
//               flightsByDateList += `
//                 <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                   и еще ${dateInfo.flights.length - 10} полетов...
//                 </div>
//               `;
//             }

//             flightsByDateList += `
//                 </div>
//               </div>
//             `;
//           });

//           if (Object.keys(flightsByDate).length > 15) {
//             flightsByDateList += `
//               <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//                 и еще ${Object.keys(flightsByDate).length - 15} дат...
//               </div>
//             `;
//           }

//           const clusterPlacemark = new window.ymaps.Placemark(
//             [cluster.lat, cluster.lng],
//             {
//               hintContent: `Группа полетов: ${cluster.count}`,
//               balloonContent: `
//                 <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                   <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                   <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                     <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                     <div style="color: #666;">полетов в этой группе</div>
//                     <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                       Группировка по близким координатам взлета
//                     </div>
//                   </div>

//                   <div>
//                     <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                       Полеты по датам:
//                     </h4>
//                     ${flightsByDateList}
//                   </div>
//                 </div>
//               `,
//             },
//             {
//               iconLayout: 'default#imageWithContent',
//               iconImageHref:
//                 'data:image/svg+xml;charset=utf-8,' +
//                 encodeURIComponent(
//                   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                     `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                     `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                     `</svg>`,
//                 ),
//               iconImageSize: [30, 30],
//               iconImageOffset: [-15, -15],
//             },
//           );
//           geoObjects.push(clusterPlacemark);
//         }
//       }

//       // Асинхронная обработка следующей партии
//       if (batchEnd < endIndex) {
//         return new Promise((resolve) => {
//           setTimeout(() => {
//             processBatch(batchEnd, endIndex, batchSize).then(resolve);
//           }, 0);
//         });
//       }

//       return Promise.resolve();
//     };

//     // Обрабатываем точки партиями для больших объемов
//     const processPoints = async () => {
//       if (clusteredPoints.length > 5000) {
//         // Для больших объемов обрабатываем по партиям
//         await processBatch(0, clusteredPoints.length, 500);
//       } else {
//         // Для малых объемов обрабатываем сразу
//         for (let i = 0; i < clusteredPoints.length; i++) {
//           const cluster = clusteredPoints[i];
//           if (!cluster) continue;

//           if (!cluster.isCluster) {
//             const point = cluster.points[0];
//             const placemark = new window.ymaps.Placemark(
//               [cluster.lat, cluster.lng],
//               {
//                 hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//                 balloonContent: `
//                   <div style="max-width: 300px;">
//                     <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                     <table style="width: 100%; border-collapse: collapse;">
//                       <tr>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 5px;"><b>Регион:</b></td>
//                         <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                       </tr>
//                     </table>
//                   </div>
//                 `,
//               },
//               {
//                 preset: 'islands#dotIcon',
//                 iconColor: '#e74c3c',
//               },
//             );
//             geoObjects.push(placemark);
//           } else {
//             const flightsByDate = {};
//             cluster.points.forEach((point) => {
//               const date = point.date || 'Не указана';
//               if (!flightsByDate[date]) {
//                 flightsByDate[date] = {
//                   flights: [],
//                   count: 0,
//                 };
//               }
//               flightsByDate[date].flights.push({
//                 id: point.id || 'Не указан',
//                 type: point.type || 'Не указан',
//                 region: point.region || 'Не определен',
//               });
//               flightsByDate[date].count++;
//             });

//             let flightsByDateList = '';
//             const dates = Object.keys(flightsByDate).slice(0, 15);

//             dates.forEach((date) => {
//               const dateInfo = flightsByDate[date];
//               const flights = dateInfo.flights.slice(0, 10);

//               flightsByDateList += `
//                 <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//                   <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                     ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//                   </div>
//                   <div style="max-height: 120px; overflow-y: auto;">
//                     <table style="width: 100%; font-size: 12px;">
//                       <thead>
//                         <tr style="background: #eee;">
//                           <th style="padding: 4px; text-align: left;">ID полета</th>
//                           <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                           <th style="padding: 4px; text-align: left;">Регион</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//               `;

//               flights.forEach((flight) => {
//                 flightsByDateList += `
//                   <tr>
//                     <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                     <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                     <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//                   </tr>
//                 `;
//               });

//               flightsByDateList += `
//                       </tbody>
//                     </table>
//               `;

//               if (dateInfo.flights.length > 10) {
//                 flightsByDateList += `
//                   <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                     и еще ${dateInfo.flights.length - 10} полетов...
//                   </div>
//                 `;
//               }

//               flightsByDateList += `
//                   </div>
//                 </div>
//               `;
//             });

//             if (Object.keys(flightsByDate).length > 15) {
//               flightsByDateList += `
//                 <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//                   и еще ${Object.keys(flightsByDate).length - 15} дат...
//                 </div>
//               `;
//             }

//             const clusterPlacemark = new window.ymaps.Placemark(
//               [cluster.lat, cluster.lng],
//               {
//                 hintContent: `Группа полетов: ${cluster.count}`,
//                 balloonContent: `
//                   <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                     <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                     <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                       <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                       <div style="color: #666;">полетов в этой группе</div>
//                       <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                         Группировка по близким координатам взлета
//                       </div>
//                     </div>

//                     <div>
//                       <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                         Полеты по датам:
//                       </h4>
//                       ${flightsByDateList}
//                     </div>
//                   </div>
//                 `,
//               },
//               {
//                 iconLayout: 'default#imageWithContent',
//                 iconImageHref:
//                   'data:image/svg+xml;charset=utf-8,' +
//                   encodeURIComponent(
//                     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                       `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                       `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                       `</svg>`,
//                   ),
//                 iconImageSize: [30, 30],
//                 iconImageOffset: [-15, -15],
//               },
//             );
//             geoObjects.push(clusterPlacemark);
//           }
//         }
//       }

//       // Добавляем все объекты к кластеризатору
//       clusterer.add(geoObjects);
//       mapInstance.geoObjects.add(clusterer);

//       // Сохраняем ссылки
//       clustererRef.current = clusterer;
//       pointsRef.current = clusteredPoints;
//       pointsRef.current.hash = newHash;

//       // Обновляем счетчик точек
//       const totalPoints = clusteredPoints.reduce((sum, cluster) => sum + cluster.count, 0);
//       console.log(`Всего точек: ${totalPoints}, кластеров: ${clusteredPoints.length}`);
//     };

//     processPoints().catch(console.error);

//     // Добавляем обработчик изменения zoom для пересоздания кластеров
//     const handleZoomChange = () => {
//       // Пересоздаем кластеры при изменении zoom
//       const newZoom = mapInstance.getZoom();
//       lastZoomRef.current = newZoom;

//       // Используем setTimeout для предотвращения блокировки UI
//       setTimeout(() => {
//         const newClusteredPoints = updateClusters(points, newZoom);
//         const newHash = getClusterHash(newClusteredPoints);

//         if (newHash !== pointsRef.current.hash) {
//           // Удаляем старый кластеризатор
//           try {
//             if (clustererRef.current && mapInstance.geoObjects) {
//               mapInstance.geoObjects.remove(clustererRef.current);
//             }
//           } catch (e) {
//             // Игнорируем ошибки очистки
//           }

//           // Создаем новый кластеризатор
//           const newClusterer = new window.ymaps.Clusterer({
//             gridSize: 64,
//             clusterDisableClickZoom: false,
//             clusterOpenBalloonOnClick: true,
//             clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//             clusterBalloonPanelMaxMapArea: 0,
//             clusterBalloonContentLayoutWidth: 200,
//             clusterBalloonContentLayoutHeight: 150,
//           });

//           // Создаем новые геообъекты
//           const newGeoObjects = [];
//           for (let i = 0; i < newClusteredPoints.length; i++) {
//             const cluster = newClusteredPoints[i];

//             if (!cluster.isCluster) {
//               const point = cluster.points[0];
//               const placemark = new window.ymaps.Placemark(
//                 [cluster.lat, cluster.lng],
//                 {
//                   hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//                   balloonContent: `
//                     <div style="max-width: 300px;">
//                       <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                       <table style="width: 100%; border-collapse: collapse;">
//                         <tr>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                           <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                         </tr>
//                         <tr>
//                           <td style="padding: 5px;"><b>Регион:</b></td>
//                           <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                         </tr>
//                       </table>
//                     </div>
//                   `,
//                 },
//                 {
//                   preset: 'islands#dotIcon',
//                   iconColor: '#e74c3c',
//                 },
//               );
//               newGeoObjects.push(placemark);
//             } else {
//               // Кластер - повторяем логику для кластера
//               const flightsByDate = {};
//               cluster.points.forEach((point) => {
//                 const date = point.date || 'Не указана';
//                 if (!flightsByDate[date]) {
//                   flightsByDate[date] = {
//                     flights: [],
//                     count: 0,
//                   };
//                 }
//                 flightsByDate[date].flights.push({
//                   id: point.id || 'Не указан',
//                   type: point.type || 'Не указан',
//                   region: point.region || 'Не определен',
//                 });
//                 flightsByDate[date].count++;
//               });

//               let flightsByDateList = '';
//               const dates = Object.keys(flightsByDate).slice(0, 15);

//               dates.forEach((date) => {
//                 const dateInfo = flightsByDate[date];
//                 const flights = dateInfo.flights.slice(0, 10);

//                 flightsByDateList += `
//                   <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//                     <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                       ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//                     </div>
//                     <div style="max-height: 120px; overflow-y: auto;">
//                       <table style="width: 100%; font-size: 12px;">
//                         <thead>
//                           <tr style="background: #eee;">
//                             <th style="padding: 4px; text-align: left;">ID полета</th>
//                             <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                             <th style="padding: 4px; text-align: left;">Регион</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                 `;

//                 flights.forEach((flight) => {
//                   flightsByDateList += `
//                     <tr>
//                       <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                       <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                       <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//                     </tr>
//                   `;
//                 });

//                 flightsByDateList += `
//                         </tbody>
//                       </table>
//                 `;

//                 if (dateInfo.flights.length > 10) {
//                   flightsByDateList += `
//                     <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                       и еще ${dateInfo.flights.length - 10} полетов...
//                     </div>
//                   `;
//                 }

//                 flightsByDateList += `
//                     </div>
//                   </div>
//                 `;
//               });

//               if (Object.keys(flightsByDate).length > 15) {
//                 flightsByDateList += `
//                   <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//                     и еще ${Object.keys(flightsByDate).length - 15} дат...
//                   </div>
//                 `;
//               }

//               const clusterPlacemark = new window.ymaps.Placemark(
//                 [cluster.lat, cluster.lng],
//                 {
//                   hintContent: `Группа полетов: ${cluster.count}`,
//                   balloonContent: `
//                     <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                       <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                       <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                         <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                         <div style="color: #666;">полетов в этой группе</div>
//                         <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                           Группировка по близким координатам взлета
//                         </div>
//                       </div>

//                       <div>
//                         <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                           Полеты по датам:
//                         </h4>
//                         ${flightsByDateList}
//                       </div>
//                     </div>
//                   `,
//                 },
//                 {
//                   iconLayout: 'default#imageWithContent',
//                   iconImageHref:
//                     'data:image/svg+xml;charset=utf-8,' +
//                     encodeURIComponent(
//                       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                         `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                         `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                         `</svg>`,
//                     ),
//                   iconImageSize: [30, 30],
//                   iconImageOffset: [-15, -15],
//                 },
//               );
//               newGeoObjects.push(clusterPlacemark);
//             }
//           }

//           newClusterer.add(newGeoObjects);
//           mapInstance.geoObjects.add(newClusterer);

//           clustererRef.current = newClusterer;
//           pointsRef.current = newClusteredPoints;
//           pointsRef.current.hash = newHash;
//         }
//       }, 0);
//     };

//     mapInstance.events.add('zoomchange', handleZoomChange);

//     return () => {
//       mapInstance.events.remove('zoomchange', handleZoomChange);

//       try {
//         if (clustererRef.current && mapInstance.geoObjects) {
//           mapInstance.geoObjects.remove(clustererRef.current);
//         }
//       } catch (e) {
//         // Игнорируем ошибки очистки
//       }
//       pointsRef.current = [];
//       clustererRef.current = null;
//     };
//   }, [mapInstance, ymapsReady, points, updateClusters, getClusterHash]);

//   return pointsRef;
// };

// // hooks/useMapPoints.js
// import { useCallback, useEffect, useRef } from 'react';

// export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
//   const pointsRef = useRef([]);
//   const clustererRef = useRef(null);

//   // Функция для кластеризации точек с учетом zoom уровня
//   const clusterPoints = useCallback((pointsArray, zoomLevel = 3) => {
//     if (!pointsArray || pointsArray.length === 0) return [];

//     console.log('Количество точек для кластеризации:', pointsArray.length);

//     // При высоком zoom уровне отключаем кластеризацию
//     if (zoomLevel >= 10) {
//       return pointsArray.map((point) => ({
//         lat: point.lat,
//         lng: point.lng,
//         count: 1,
//         isCluster: false,
//         points: [point],
//       }));
//     }

//     // Определяем степень кластеризации в зависимости от zoom
//     const gridSize = Math.max(1, 12 - zoomLevel); // Чем больше zoom, тем меньше сетка
//     const clusters = new Map();

//     for (let i = 0; i < pointsArray.length; i++) {
//       const point = pointsArray[i];
//       if (point.lat == null || point.lng == null) continue;

//       // Округляем координаты для группировки с большей точностью
//       const latKey = Math.round(point.lat * gridSize * 100) / (gridSize * 100);
//       const lngKey = Math.round(point.lng * gridSize * 100) / (gridSize * 100);
//       const key = `${latKey}_${lngKey}`;

//       if (!clusters.has(key)) {
//         clusters.set(key, {
//           lat: latKey,
//           lng: lngKey,
//           count: 0,
//           points: [],
//         });
//       }

//       const cluster = clusters.get(key);
//       cluster.count++;
//       cluster.points.push(point);
//     }

//     // Преобразуем в массив и фильтруем кластеры с данными
//     return Array.from(clusters.values())
//       .filter((cluster) => cluster.count > 0)
//       .map((cluster) => ({
//         lat: cluster.lat,
//         lng: cluster.lng,
//         count: cluster.count,
//         isCluster: cluster.count > 1,
//         points: cluster.points,
//       }));
//   }, []);

//   // Функция для создания хэша кластеров
//   const getClusterHash = useCallback((clusters) => {
//     if (!clusters || clusters.length === 0) return '';

//     // Берем только первые 1000 кластеров для хэширования
//     const keys = [];
//     for (let i = 0; i < Math.min(clusters.length, 1000); i++) {
//       const cluster = clusters[i];
//       keys.push(
//         `${Math.round(cluster.lat * 1000)}-${Math.round(cluster.lng * 1000)}-${cluster.count}`,
//       );
//     }
//     return keys.sort().join('|');
//   }, []);

//   useEffect(() => {
//     if (!mapInstance || !ymapsReady || !points) return;

//     // Получаем текущий zoom level для кластеризации
//     const zoom = mapInstance.getZoom();
//     const clusteredPoints = clusterPoints(points, zoom);

//     // Проверяем, изменились ли кластеры
//     const newHash = getClusterHash(clusteredPoints);
//     const currentHash = pointsRef.current.hash || '';

//     if (currentHash === newHash && pointsRef.current.length > 0) {
//       return;
//     }

//     // Очищаем старые точки
//     try {
//       if (clustererRef.current && mapInstance.geoObjects) {
//         mapInstance.geoObjects.remove(clustererRef.current);
//       }
//     } catch (e) {
//       // Игнорируем ошибки очистки
//     }

//     // Создаем новый кластеризатор
//     const clusterer = new window.ymaps.Clusterer({
//       gridSize: 64,
//       clusterDisableClickZoom: false,
//       clusterOpenBalloonOnClick: true,
//       clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//       clusterBalloonPanelMaxMapArea: 0,
//       clusterBalloonContentLayoutWidth: 200,
//       clusterBalloonContentLayoutHeight: 150,
//     });

//     // Создаем метки для кластеров
//     const geoObjects = [];

//     for (let i = 0; i < clusteredPoints.length; i++) {
//       const cluster = clusteredPoints[i];

//       if (!cluster.isCluster) {
//         // Одиночная точка - делаем очень маленькую иконку
//         const point = cluster.points[0];
//         const placemark = new window.ymaps.Placemark(
//           [cluster.lat, cluster.lng],
//           {
//             hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//             balloonContent: `
//               <div style="max-width: 300px;">
//                 <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                 <table style="width: 100%; border-collapse: collapse;">
//                   <tr>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 5px;"><b>Регион:</b></td>
//                     <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                   </tr>
//                 </table>
//               </div>
//             `,
//           },
//           {
//             preset: 'islands#dotIcon',
//             iconColor: '#e74c3c',
//           },
//         );
//         geoObjects.push(placemark);
//       } else {
//         // Кластер - создаем кастомную метку с улучшенным балуном
//         // Группируем полеты по датам
//         const flightsByDate = {};
//         cluster.points.forEach((point) => {
//           const date = point.date || 'Не указана';
//           if (!flightsByDate[date]) {
//             flightsByDate[date] = {
//               flights: [],
//               count: 0,
//             };
//           }
//           flightsByDate[date].flights.push({
//             id: point.id || 'Не указан',
//             type: point.type || 'Не указан',
//             region: point.region || 'Не определен'
//           });
//           flightsByDate[date].count++;
//         });

//         // Формируем структурированный список по датам
//         let flightsByDateList = '';
//         const dates = Object.keys(flightsByDate).slice(0, 15); // Ограничиваем до 15 дат

//         dates.forEach((date) => {
//           const dateInfo = flightsByDate[date];
//           const flights = dateInfo.flights.slice(0, 10); // Ограничиваем до 10 полетов в день

//           flightsByDateList += `
//             <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//               <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                 ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//               </div>
//               <div style="max-height: 120px; overflow-y: auto;">
//                 <table style="width: 100%; font-size: 12px;">
//                   <thead>
//                     <tr style="background: #eee;">
//                       <th style="padding: 4px; text-align: left;">ID полета</th>
//                       <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                       <th style="padding: 4px; text-align: left;">Регион</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//           `;

//           flights.forEach((flight) => {
//             flightsByDateList += `
//               <tr>
//                 <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                 <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                 <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//               </tr>
//             `;
//           });

//           flightsByDateList += `
//                   </tbody>
//                 </table>
//           `;

//           if (dateInfo.flights.length > 10) {
//             flightsByDateList += `
//               <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                 и еще ${dateInfo.flights.length - 10} полетов...
//               </div>
//             `;
//           }

//           flightsByDateList += `
//               </div>
//             </div>
//           `;
//         });

//         if (Object.keys(flightsByDate).length > 15) {
//           flightsByDateList += `
//             <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//               и еще ${Object.keys(flightsByDate).length - 15} дат...
//             </div>
//           `;
//         }

//         const clusterPlacemark = new window.ymaps.Placemark(
//           [cluster.lat, cluster.lng],
//           {
//             hintContent: `Группа полетов: ${cluster.count}`,
//             balloonContent: `
//               <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                 <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                 <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                   <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                   <div style="color: #666;">полетов в этой группе</div>
//                   <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                     Группировка по близким координатам взлета
//                   </div>
//                 </div>

//                 <div>
//                   <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                     Полеты по датам:
//                   </h4>
//                   ${flightsByDateList}
//                 </div>
//               </div>
//             `,
//           },
//           {
//             iconLayout: 'default#imageWithContent',
//             iconImageHref:
//               'image/svg+xml;charset=utf-8,' +
//               encodeURIComponent(
//                 `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                   `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                   `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                   `</svg>`,
//               ),
//             iconImageSize: [30, 30],
//             iconImageOffset: [-15, -15],
//           },
//         );
//         geoObjects.push(clusterPlacemark);
//       }
//     }

//     clusterer.add(geoObjects);
//     mapInstance.geoObjects.add(clusterer);

//     // Сохраняем ссылки
//     clustererRef.current = clusterer;
//     pointsRef.current = clusteredPoints;
//     pointsRef.current.hash = newHash;

//     // Добавляем обработчик изменения zoom для пересоздания кластеров
//     const handleZoomChange = () => {
//       // Пересоздаем кластеры при изменении zoom
//       const newZoom = mapInstance.getZoom();
//       const newClusteredPoints = clusterPoints(points, newZoom);
//       const newHash = getClusterHash(newClusteredPoints);

//       if (newHash !== pointsRef.current.hash) {
//         // Удаляем старый кластеризатор
//         try {
//           if (clustererRef.current && mapInstance.geoObjects) {
//             mapInstance.geoObjects.remove(clustererRef.current);
//           }
//         } catch (e) {
//           // Игнорируем ошибки очистки
//         }

//         // Создаем новый кластеризатор
//         const newClusterer = new window.ymaps.Clusterer({
//           gridSize: 64,
//           clusterDisableClickZoom: false,
//           clusterOpenBalloonOnClick: true,
//           clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//           clusterBalloonPanelMaxMapArea: 0,
//           clusterBalloonContentLayoutWidth: 200,
//           clusterBalloonContentLayoutHeight: 150,
//         });

//         const newGeoObjects = [];
//         for (let i = 0; i < newClusteredPoints.length; i++) {
//           const cluster = newClusteredPoints[i];

//           if (!cluster.isCluster) {
//             const point = cluster.points[0];
//             const placemark = new window.ymaps.Placemark(
//               [cluster.lat, cluster.lng],
//               {
//                 hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//                 balloonContent: `
//                   <div style="max-width: 300px;">
//                     <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                     <table style="width: 100%; border-collapse: collapse;">
//                       <tr>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                         <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding: 5px;"><b>Регион:</b></td>
//                         <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                       </tr>
//                     </table>
//                   </div>
//                 `,
//               },
//               {
//                 preset: 'islands#dotIcon',
//                 iconColor: '#e74c3c',
//               },
//             );
//             newGeoObjects.push(placemark);
//           } else {
//             // Кластер - повторяем логику для кластера
//             const flightsByDate = {};
//             cluster.points.forEach((point) => {
//               const date = point.date || 'Не указана';
//               if (!flightsByDate[date]) {
//                 flightsByDate[date] = {
//                   flights: [],
//                   count: 0,
//                 };
//               }
//               flightsByDate[date].flights.push({
//                 id: point.id || 'Не указан',
//                 type: point.type || 'Не указан',
//                 region: point.region || 'Не определен'
//               });
//               flightsByDate[date].count++;
//             });

//             let flightsByDateList = '';
//             const dates = Object.keys(flightsByDate).slice(0, 15);

//             dates.forEach((date) => {
//               const dateInfo = flightsByDate[date];
//               const flights = dateInfo.flights.slice(0, 10);

//               flightsByDateList += `
//                 <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//                   <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                     ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//                   </div>
//                   <div style="max-height: 120px; overflow-y: auto;">
//                     <table style="width: 100%; font-size: 12px;">
//                       <thead>
//                         <tr style="background: #eee;">
//                           <th style="padding: 4px; text-align: left;">ID полета</th>
//                           <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                           <th style="padding: 4px; text-align: left;">Регион</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//               `;

//               flights.forEach((flight) => {
//                 flightsByDateList += `
//                   <tr>
//                     <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                     <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                     <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//                   </tr>
//                 `;
//               });

//               flightsByDateList += `
//                       </tbody>
//                     </table>
//               `;

//               if (dateInfo.flights.length > 10) {
//                 flightsByDateList += `
//                   <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                     и еще ${dateInfo.flights.length - 10} полетов...
//                   </div>
//                 `;
//               }

//               flightsByDateList += `
//                   </div>
//                 </div>
//               `;
//             });

//             if (Object.keys(flightsByDate).length > 15) {
//               flightsByDateList += `
//                 <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//                   и еще ${Object.keys(flightsByDate).length - 15} дат...
//                 </div>
//               `;
//             }

//             const clusterPlacemark = new window.ymaps.Placemark(
//               [cluster.lat, cluster.lng],
//               {
//                 hintContent: `Группа полетов: ${cluster.count}`,
//                 balloonContent: `
//                   <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                     <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                     <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                       <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
//                       <div style="color: #666;">полетов в этой группе</div>
//                       <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                         Группировка по близким координатам взлета
//                       </div>
//                     </div>

//                     <div>
//                       <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                         Полеты по датам:
//                       </h4>
//                       ${flightsByDateList}
//                     </div>
//                   </div>
//                 `,
//               },
//               {
//                 iconLayout: 'default#imageWithContent',
//                 iconImageHref:
//                   'image/svg+xml;charset=utf-8,' +
//                   encodeURIComponent(
//                     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                       `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                       `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                       `</svg>`,
//                   ),
//                 iconImageSize: [30, 30],
//                 iconImageOffset: [-15, -15],
//               },
//             );
//             newGeoObjects.push(clusterPlacemark);
//           }
//         }

//         newClusterer.add(newGeoObjects);
//         mapInstance.geoObjects.add(newClusterer);

//         clustererRef.current = newClusterer;
//         pointsRef.current = newClusteredPoints;
//         pointsRef.current.hash = newHash;
//       }
//     };

//     mapInstance.events.add('zoomchange', handleZoomChange);

//     return () => {
//       mapInstance.events.remove('zoomchange', handleZoomChange);

//       try {
//         if (clustererRef.current && mapInstance.geoObjects) {
//           mapInstance.geoObjects.remove(clustererRef.current);
//         }
//       } catch (e) {
//         // Игнорируем ошибки очистки
//       }
//       pointsRef.current = [];
//       clustererRef.current = null;
//     };
//   }, [mapInstance, ymapsReady, points, clusterPoints, getClusterHash]);

//   return pointsRef;
// };

// Рабочий ПРОВЕРЕННЫЙ
// // hooks/useMapPoints.js
// import { useCallback, useEffect, useRef } from 'react';

// export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
//   const pointsRef = useRef([]);
//   const clustererRef = useRef(null);

//   // Функция для кластеризации точек с учетом zoom уровня
//   const clusterPoints = useCallback((pointsArray, zoomLevel = 3) => {
//     if (!pointsArray || pointsArray.length === 0) return [];

//     console.log(pointsArray);

//     // При высоком zoom уровне отключаем кластеризацию
//     if (zoomLevel >= 10) {
//       return pointsArray.map((point) => ({
//         lat: point.lat,
//         lng: point.lng,
//         count: 1,
//         isCluster: false,
//         points: [point],
//       }));
//     }

//     // Определяем степень кластеризации в зависимости от zoom
//     const gridSize = Math.max(1, 12 - zoomLevel); // Чем больше zoom, тем меньше сетка
//     const clusters = new Map();

//     for (let i = 0; i < pointsArray.length; i++) {
//       const point = pointsArray[i];
//       if (point.lat == null || point.lng == null) continue;

//       // Округляем координаты для группировки
//       const latKey = Math.round(point.lat * gridSize) / gridSize;
//       const lngKey = Math.round(point.lng * gridSize) / gridSize;
//       const key = `${latKey}_${lngKey}`;

//       if (!clusters.has(key)) {
//         clusters.set(key, {
//           lat: latKey,
//           lng: lngKey,
//           count: 0,
//           points: [],
//         });
//       }

//       const cluster = clusters.get(key);
//       cluster.count++;
//       cluster.points.push(point);
//     }

//     // Преобразуем в массив и фильтруем кластеры с данными
//     return Array.from(clusters.values())
//       .filter((cluster) => cluster.count > 0)
//       .map((cluster) => ({
//         lat: cluster.lat,
//         lng: cluster.lng,
//         count: cluster.count,
//         isCluster: cluster.count > 1,
//         points: cluster.points,
//       }));
//   }, []);

//   // Функция для создания хэша кластеров
//   const getClusterHash = useCallback((clusters) => {
//     if (!clusters || clusters.length === 0) return '';

//     // Берем только первые 1000 кластеров для хэширования
//     const keys = [];
//     for (let i = 0; i < Math.min(clusters.length, 1000); i++) {
//       const cluster = clusters[i];
//       keys.push(
//         `${Math.round(cluster.lat * 100)}-${Math.round(cluster.lng * 100)}-${cluster.count}`,
//       );
//     }
//     return keys.sort().join('|');
//   }, []);

//   useEffect(() => {
//     if (!mapInstance || !ymapsReady || !points) return;

//     // Получаем текущий zoom level для кластеризации
//     const zoom = mapInstance.getZoom();
//     const clusteredPoints = clusterPoints(points, zoom);

//     // Проверяем, изменились ли кластеры
//     const newHash = getClusterHash(clusteredPoints);
//     const currentHash = pointsRef.current.hash || '';

//     if (currentHash === newHash && pointsRef.current.length > 0) {
//       return;
//     }

//     // Очищаем старые точки
//     try {
//       if (clustererRef.current && mapInstance.geoObjects) {
//         mapInstance.geoObjects.remove(clustererRef.current);
//       }
//     } catch (e) {
//       // Игнорируем ошибки очистки
//     }

//     // Создаем новый кластеризатор
//     const clusterer = new window.ymaps.Clusterer({
//       gridSize: 64,
//       clusterDisableClickZoom: false,
//       clusterOpenBalloonOnClick: true,
//       clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
//       clusterBalloonPanelMaxMapArea: 0,
//       clusterBalloonContentLayoutWidth: 200,
//       clusterBalloonContentLayoutHeight: 150,
//     });

//     // Создаем метки для кластеров
//     const geoObjects = [];

//     for (let i = 0; i < clusteredPoints.length; i++) {
//       const cluster = clusteredPoints[i];

//       if (!cluster.isCluster) {
//         // Одиночная точка - делаем очень маленькую иконку
//         const point = cluster.points[0];
//         const placemark = new window.ymaps.Placemark(
//           [cluster.lat, cluster.lng],
//           {
//             hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
//             balloonContent: `
//               <div style="max-width: 300px;">
//                 <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
//                 <table style="width: 100%; border-collapse: collapse;">
//                   <tr>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
//                     <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
//                   </tr>
//                   <tr>
//                     <td style="padding: 5px;"><b>Регион:</b></td>
//                     <td style="padding: 5px;">${point.region || 'Не определен'}</td>
//                   </tr>
//                 </table>
//               </div>
//             `,
//           },
//           {
//             preset: 'islands#dotIcon',
//             iconColor: '#e74c3c',
//           },
//         );
//         geoObjects.push(placemark);
//       } else {
//         // Кластер - создаем кастомную метку с улучшенным балуном
//         // Группируем полеты по датам
//         const flightsByDate = {};
//         cluster.points.forEach((point) => {
//           const date = point.date || 'Не указана';
//           if (!flightsByDate[date]) {
//             flightsByDate[date] = {
//               flights: [],
//               count: 0,
//             };
//           }
//           flightsByDate[date].flights.push({
//             id: point.id || 'Не указан',
//             type: point.type || 'Не указан',
//             region: point.region || 'Не определен'
//           });
//           flightsByDate[date].count++;
//         });

//         // Формируем структурированный список по датам
//         let flightsByDateList = '';
//         const dates = Object.keys(flightsByDate).slice(0, 15); // Ограничиваем до 15 дат

//         dates.forEach((date) => {
//           const dateInfo = flightsByDate[date];
//           const flights = dateInfo.flights.slice(0, 10); // Ограничиваем до 10 полетов в день

//           flightsByDateList += `
//             <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
//               <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
//                 ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
//               </div>
//               <div style="max-height: 120px; overflow-y: auto;">
//                 <table style="width: 100%; font-size: 12px;">
//                   <thead>
//                     <tr style="background: #eee;">
//                       <th style="padding: 4px; text-align: left;">ID полета</th>
//                       <th style="padding: 4px; text-align: left;">Тип ВС</th>
//                       <th style="padding: 4px; text-align: left;">Регион</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//           `;

//           flights.forEach((flight) => {
//             flightsByDateList += `
//               <tr>
//                 <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
//                 <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
//                 <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
//               </tr>
//             `;
//           });

//           flightsByDateList += `
//                   </tbody>
//                 </table>
//           `;

//           if (dateInfo.flights.length > 10) {
//             flightsByDateList += `
//               <div style="color: #777; font-size: 11px; margin-top: 5px;">
//                 и еще ${dateInfo.flights.length - 10} полетов...
//               </div>
//             `;
//           }

//           flightsByDateList += `
//               </div>
//             </div>
//           `;
//         });

//         if (Object.keys(flightsByDate).length > 15) {
//           flightsByDateList += `
//             <div style="color: #777; font-size: 12px; text-align: center; padding: 10px;">
//               и еще ${Object.keys(flightsByDate).length - 15} дат...
//             </div>
//           `;
//         }

//         const clusterPlacemark = new window.ymaps.Placemark(
//           [cluster.lat, cluster.lng],
//           {
//             hintContent: `Группа полетов: ${cluster.count}`,
//             balloonContent: `
//               <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
//                 <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
//                 <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
//                   <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count}</div>
//                   <div style="color: #666;">полетов в этой группе</div>
//                   <div style="font-size: 12px; color: #999; margin-top: 5px;">
//                     Группировка по близким координатам взлета
//                   </div>
//                 </div>

//                 <div>
//                   <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
//                     Полеты по датам:
//                   </h4>
//                   ${flightsByDateList}
//                 </div>
//               </div>
//             `,
//           },
//           {
//             iconLayout: 'default#imageWithContent',
//             iconImageHref:
//               'data:image/svg+xml;charset=utf-8,' +
//               encodeURIComponent(
//                 `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
//                   `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
//                   `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
//                   `</svg>`,
//               ),
//             iconImageSize: [30, 30],
//             iconImageOffset: [-15, -15],
//           },
//         );
//         geoObjects.push(clusterPlacemark);
//       }
//     }

//     clusterer.add(geoObjects);
//     mapInstance.geoObjects.add(clusterer);

//     // Сохраняем ссылки
//     clustererRef.current = clusterer;
//     pointsRef.current = clusteredPoints;
//     pointsRef.current.hash = newHash;

//     // Добавляем обработчик изменения zoom для пересоздания кластеров
//     const handleZoomChange = () => {
//       // Просто перезапускаем эффект при изменении zoom
//       // React сам пересоздаст кластеры с новым zoom уровнем
//     };

//     mapInstance.events.add('zoomchange', handleZoomChange);

//     return () => {
//       mapInstance.events.remove('zoomchange', handleZoomChange);

//       try {
//         if (clustererRef.current && mapInstance.geoObjects) {
//           mapInstance.geoObjects.remove(clustererRef.current);
//         }
//       } catch (e) {
//         // Игнорируем ошибки очистки
//       }
//       pointsRef.current = [];
//       clustererRef.current = null;
//     };
//   }, [mapInstance, ymapsReady, points, clusterPoints, getClusterHash]);

//   return pointsRef;
// };
