// components/MapVisualization/MapVisualization.jsx
import { geoIdentity, geoPath, select, zoom, zoomIdentity } from 'd3';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { createCities } from '../d3/createCities';
import { createRegionsWithFlightData } from '../d3/createRegionsWithFlightData';
import { resetRegionButton } from '../d3/resetRegionButton';
import { resetZoomButton } from '../d3/resetZoomButton';
import { swapMapDataCoordinates } from '../utils/swapMapDataCoordinates';

const MapVisualization = forwardRef(
  (
    { mapData, selectedRegion, flightsByRegion, maxFlightsInRegion, onRegionSelect, onResetRegion },
    ref,
  ) => {
    const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
    const mapGroupRef = useRef(null); // Для хранения группы карты
    const zoomBehaviorRef = useRef(null); // Для хранения поведения зума
    const svgRef = useRef(null); // Для хранения SVG
    const [zoomLevel, setZoomLevel] = useState(1);

    const renderMap = useCallback(
      (dataToRender, isSingleRegion = false) => {
        const svg = select(ref.current);
        svgRef.current = svg.node(); // Сохраняем ссылку на SVG
        // Полностью очищаем SVG при каждом рендере
        svg.selectAll('*').remove();

        const width = 1200;
        const height = 600;

        svg
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('style', 'max-width: 100%; background-color: #2c3e50;');

        const projection = geoIdentity().reflectY(true).fitSize([width, height], dataToRender);

        if (!isSingleRegion) {
          const currentScale = projection.scale();
          projection.scale(currentScale * 2);

          const currentTranslate = projection.translate();
          const currentCenterX = currentTranslate[0];
          const currentCenterY = currentTranslate[1];

          const newTranslateX = width / 2 - (width / 1.3 - currentCenterX) * 2;
          const newTranslateY = height / 2 - (height / 2 - currentCenterY) * 2;

          projection.translate([newTranslateX, newTranslateY]);
        }

        const path = geoPath().projection(projection);
        const mapGroup = svg.append('g').attr('class', 'map-group');
        mapGroupRef.current = mapGroup.node(); // Сохраняем ссылку на группу

        // Создаем регионы
        createRegionsWithFlightData({
          svg,
          mapGroup,
          dataToRender,
          path,
          setSelectedRegion: onRegionSelect,
          isSingleRegion,
          setTooltip,
          height,
          flightsByRegion,
          maxFlightsInRegion,
        });

        // Создаем города
        createCities({
          mapGroup,
          mapData: dataToRender,
          path,
          setTooltip,
          isSingleRegion,
          height,
        });

        // Создаем и сохраняем поведение зума
        const zoomBehavior = zoom()
          .scaleExtent([1, 100])
          .on('zoom', (event) => {
            mapGroup.attr('transform', event.transform);
            // Обновляем уровень зума для управления видимостью элементов
            setZoomLevel(event.transform.k);
          });

        svg.call(zoomBehavior);
        zoomBehaviorRef.current = zoomBehavior; // Сохраняем поведение зума

        // Кнопки управления
        resetZoomButton(svg, () => {
          // Функция сброса зума
          if (svgRef.current && zoomBehaviorRef.current) {
            select(svgRef.current)
              .transition()
              .duration(750)
              .call(zoomBehaviorRef.current.transform, zoomIdentity);
            setZoomLevel(1); // Обновляем состояние
          }
        });
        resetRegionButton(svg, onResetRegion);
      },
      [ref, onRegionSelect, onResetRegion, setTooltip, flightsByRegion, maxFlightsInRegion],
    );

    useEffect(() => {
      const swappedMapData = swapMapDataCoordinates(mapData);

      let dataToRender;
      let isSingleRegion = false;

      if (selectedRegion) {
        const foundFeature = swappedMapData.features.find(
          (feature) =>
            feature.properties?.['hc-key'] === selectedRegion.id ||
            feature.properties?.region === selectedRegion.id,
        );

        if (foundFeature) {
          dataToRender = {
            type: 'FeatureCollection',
            features: [foundFeature],
          };
          isSingleRegion = true;
        } else {
          dataToRender = swappedMapData;
        }
      } else {
        dataToRender = swappedMapData;
      }

      if (
        (dataToRender.type === 'FeatureCollection' && dataToRender.features.length > 0) ||
        dataToRender.type === 'Feature'
      ) {
        renderMap(dataToRender, isSingleRegion);
      }
    }, [mapData, selectedRegion, renderMap]);

    return (
      <div className="map-visualization">
        <div className="svg-container">
          <svg ref={ref} className="russia-map-svg"></svg>

          {tooltip.visible && (
            <div
              className="custom-tooltip"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translateZ(0)',
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.content }}
            />
          )}
        </div>
      </div>
    );
  },
);

export default MapVisualization;

// // components/MapVisualization/MapVisualization.jsx
// import { geoIdentity, geoPath, select } from 'd3';

// import { forwardRef, useCallback, useEffect, useState } from 'react';

// import { createCities } from '../d3/createCities';
// import { createRegionsWithFlightData } from '../d3/createRegionsWithFlightData';
// import { resetRegionButton } from '../d3/resetRegionButton';
// import { resetZoomButton } from '../d3/resetZoomButton';
// import { useMapZoom } from '../d3/useMapZoom';
// import { swapMapDataCoordinates } from '../utils/swapMapDataCoordinates';

// const MapVisualization = forwardRef(
//   (
//     { mapData, selectedRegion, flightsByRegion, maxFlightsInRegion, onRegionSelect, onResetRegion },
//     ref,
//   ) => {
//     const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
//     const { initializeZoom, resetZoom } = useMapZoom();

//     const renderMap = useCallback(
//       (dataToRender, isSingleRegion = false) => {
//         const svg = select(ref.current);
//         // Полностью очищаем SVG при каждом рендере для простоты
//         svg.selectAll('*').remove();

//         const width = 1200;
//         const height = 600;

//         svg
//           .attr('width', width)
//           .attr('height', height)
//           .attr('viewBox', `0 0 ${width} ${height}`)
//           .attr('style', 'max-width: 100%; background-color: #2c3e50;');

//         const projection = geoIdentity().reflectY(true).fitSize([width, height], dataToRender);

//         if (!isSingleRegion) {
//           const currentScale = projection.scale();
//           projection.scale(currentScale * 2);

//           const currentTranslate = projection.translate();
//           const currentCenterX = currentTranslate[0];
//           const currentCenterY = currentTranslate[1];

//           const newTranslateX = width / 2 - (width / 1.3 - currentCenterX) * 2;
//           const newTranslateY = height / 2 - (height / 2 - currentCenterY) * 2;

//           projection.translate([newTranslateX, newTranslateY]);
//         }

//         const path = geoPath().projection(projection);
//         const mapGroup = svg.append('g').attr('class', 'map-group');

//         createRegionsWithFlightData({
//           svg,
//           mapGroup,
//           dataToRender,
//           path,
//           setSelectedRegion: onRegionSelect,
//           isSingleRegion,
//           setTooltip,
//           height,
//           flightsByRegion,
//           maxFlightsInRegion,
//           // --- Отладочные параметры ---
//           debug_flightsByRegion: flightsByRegion,
//           debug_maxFlightsInRegion: maxFlightsInRegion,
//           // --- Конец отладочных параметров ---
//         });

//         // 2. Города (всегда, для всей карты)
//         // Передаем все данные регионов
//         createCities({
//           svg,
//           mapGroup,
//           mapData: dataToRender, // Передаем все данные карты
//           path,
//           setTooltip,
//           height,
//           isSingleRegion,
//           // Можно добавить логику отображения/скрытия на основе зума, если нужно
//           zoomLevel: 1, // Или получить реальный уровень зума
//         });

//         resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
//         resetRegionButton(svg, onResetRegion);
//       },
//       [
//         ref,
//         initializeZoom,
//         resetZoom,
//         onRegionSelect,
//         onResetRegion,
//         setTooltip,
//         flightsByRegion,
//         maxFlightsInRegion,
//       ],
//     );

//     useEffect(() => {
//       const swappedMapData = swapMapDataCoordinates(mapData);

//       let dataToRender;
//       let isSingleRegion = false;

//       if (selectedRegion) {
//         const foundFeature = swappedMapData.features.find(
//           (feature) =>
//             feature.properties?.['hc-key'] === selectedRegion.id ||
//             feature.properties?.region === selectedRegion.id,
//         );

//         if (foundFeature) {
//           dataToRender = {
//             type: 'FeatureCollection',
//             features: [foundFeature],
//           };
//           isSingleRegion = true;
//         } else {
//           dataToRender = swappedMapData;
//         }
//       } else {
//         dataToRender = swappedMapData;
//       }

//       if (
//         (dataToRender.type === 'FeatureCollection' && dataToRender.features.length > 0) ||
//         dataToRender.type === 'Feature'
//       ) {
//         renderMap(dataToRender, isSingleRegion);
//       }
//     }, [mapData, selectedRegion, renderMap]);

//     return (
//       <div className="map-visualization">
//         <div className="svg-container">
//           <svg ref={ref} className="russia-map-svg"></svg>

//           {tooltip.visible && (
//             <div
//               className="custom-tooltip"
//               style={{
//                 left: `${tooltip.x}px`,
//                 top: `${tooltip.y}px`,
//                 transform: 'translateZ(0)',
//               }}
//               dangerouslySetInnerHTML={{ __html: tooltip.content }}
//             />
//           )}
//         </div>
//       </div>
//     );
//   },
// );

// export default MapVisualization;
