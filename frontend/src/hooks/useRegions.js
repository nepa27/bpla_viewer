import { useEffect, useState } from 'react';

// import jsonData from '../utils/russia_regions.geo.json';
import jsonData from '../utils/russia_regions_cap.geo.json';

// let str = Array.from(jsonData.features).map(f => f.properties.region).join(', ');

// console.log('TUT ' , str)

export const useRegions = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // json(jsonUrl).then(setData);
    setData(jsonData);
  }, []);

  return data;
};

// // useRussianAtlas.js (Второй вариант, исправленный)
// import { useEffect, useState } from 'react';

// export const useRussianAtlas = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const response = await fetch('/rus_simple_highcharts.geo.json');
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const geoJson = await response.json();

//         console.log("Original GeoJSON loaded");

//         // Исправляем координаты из [lat, lng] в [lng, lat]
//         const fixedFeatures = geoJson.features.map(feature => {
//           const geometry = feature.geometry;
//           if (!geometry) return feature; // Пропустить, если геометрии нет

//           let fixedGeometry = geometry;

//           if (geometry.type === 'MultiPolygon') {
//             const fixedCoordinates = geometry.coordinates.map(polygonGroup =>
//               polygonGroup.map(polygon =>
//                 // Меняем местами [lat, lng] -> [lng, lat]
//                 polygon.map(([lat, lng]) => [lng, lat])
//               )
//             );
//             fixedGeometry = {
//               ...geometry,
//               coordinates: fixedCoordinates
//             };
//           } else if (geometry.type === 'Polygon') {
//              // На случай, если будут полигоны
//              const fixedCoordinates = geometry.coordinates.map(polygon =>
//                 polygon.map(([lat, lng]) => [lng, lat])
//              );
//              fixedGeometry = {
//                 ...geometry,
//                 coordinates: fixedCoordinates
//              };
//           }
//           // Можно добавить обработку Point, LineString и т.д.

//           return {
//             ...feature,
//             geometry: fixedGeometry
//           };
//         });

//         const fixedGeoJson = {
//           ...geoJson,
//           features: fixedFeatures
//         };

//         console.log("Fixed GeoJSON:", fixedGeoJson);

//         setData({
//           regions: fixedGeoJson // Передаем исправленные данные
//         });
//       } catch (error) {
//         console.error('Error loading or processing Russian atlas:', error);
//       }
//     };

//     loadData();
//   }, []);

//   return data;
// };
