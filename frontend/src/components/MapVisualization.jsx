import { geoIdentity, geoPath, select } from 'd3';

import { forwardRef, useCallback, useEffect } from 'react';

import { createFlightPoints } from '../d3/createFlightPoints';
import { createRegions } from '../d3/createRegions';
import { resetRegionButton } from '../d3/resetRegionButton';
import { resetZoomButton } from '../d3/resetZoomButton';
import { useMapZoom } from '../d3/useMapZoom';
import { swapMapDataCoordinates } from '../utils/swapMapDataCoordinates';

const MapVisualization = forwardRef(
  (
    {
      mapData,
      selectedRegion,
      filteredFlights,
      onRegionSelect,
      onResetRegion,
      tooltip,
      setTooltip,
    },
    ref,
  ) => {
    const { initializeZoom, resetZoom } = useMapZoom();

    const renderMap = useCallback(
      (dataToRender, isSingleRegion = false) => {
        if (!dataToRender) return;

        const svg = select(ref.current);
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

        createRegions({
          svg,
          mapGroup,
          dataToRender,
          path,
          setSelectedRegion: onRegionSelect,
          isSingleRegion,
          setTooltip,
          height,
        });

        createFlightPoints({
          svg,
          mapGroup,
          filteredFlights,
          projection,
          isSingleRegion,
          setTooltip,
          height,
        });

        resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
        resetRegionButton(svg, onResetRegion);
      },
      [ref, filteredFlights, initializeZoom, resetZoom, onRegionSelect, onResetRegion, setTooltip],
    );

    useEffect(() => {
      if (!mapData) return;

      // Заменяем координаты местами
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
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default MapVisualization;

/*
// ДЛЯ createCities
// src/components/MapVisualization.jsx
import { geoIdentity, geoPath, select } from 'd3';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { createFlightPoints } from '../d3/createFlightPoints';
import { createRegions } from '../d3/createRegions';
import { createCities } from '../d3/createCities'; // Убедитесь, что этот модуль существует и обновлен
import { resetRegionButton } from '../d3/resetRegionButton';
import { resetZoomButton } from '../d3/resetZoomButton';
import { useMapZoom } from '../d3/useMapZoom';
import { swapMapDataCoordinates } from '../utils/swapMapDataCoordinates';

const MapVisualization = forwardRef(
  (
    {
      mapData,
      selectedRegion, // Может использоваться для подсветки, но не влияет на отображение точек
      filteredFlights,
      onRegionSelect,
      onResetRegion,
      tooltip,
      setTooltip,
    },
    ref
  ) => {
    const { initializeZoom, resetZoom } = useMapZoom();

    const renderMap = useCallback(
      (dataToRender, isSingleRegion = false) => {
        if (!dataToRender || !ref.current) {
          console.error('renderMap: Invalid data or ref.');
          return;
        }

        const svg = select(ref.current);
        svg.selectAll('*').remove();

        const width = 1200;
        const height = 600;

        svg
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('style', 'max-width: 100%; height: auto; background-color: #2c3e50;');

        // Создаем группу для зума
        const zoomGroup = svg.append('g').attr('class', 'zoom-group');

        // Настройка проекции
        const projection = geoIdentity().reflectY(true).fitSize([width, height], dataToRender);

        if (!isSingleRegion) {
          // const currentScale = projection.scale();
          // projection.scale(currentScale * 2);

          // const currentTranslate = projection.translate();
          // const currentCenterX = currentTranslate[0];
          // const currentCenterY = currentTranslate[1];

          // const newTranslateX = width / 2 - (width / 1.3 - currentCenterX) * 2;
          // const newTranslateY = height / 2 - (height / 2 - currentCenterY) * 2;

          // projection.translate([newTranslateX, newTranslateY]);
        }

        const path = geoPath().projection(projection);
        const mapGroup = zoomGroup.append('g').attr('class', 'map-group');

        // Инициализируем зум
        initializeZoom(svg, zoomGroup, width, height);

        // --- ОТРИСОВКА ЭЛЕМЕНТОВ ---
        // 1. Регионы (всегда)
        createRegions({
          svg,
          mapGroup,
          dataToRender,
          path,
          setSelectedRegion: onRegionSelect,
          isSingleRegion,
          setTooltip,
          height,
        });

        // 2. Города (всегда, для всей карты)
        // Передаем все данные регионов
        createCities({
            svg,
            mapGroup,
            mapData: dataToRender, // Передаем все данные карты
            path,
            setTooltip,
            height,
            // Можно добавить логику отображения/скрытия на основе зума, если нужно
            zoomLevel: 1, // Или получить реальный уровень зума
        });

        // 3. Точки полетов (всегда)
        // Передаем все точки
        createFlightPoints({
            svg,
            mapGroup,
            filteredFlights, // Передаем все отфильтрованные точки
            projection,
            isSingleRegion: false, // Всегда false теперь
            setTooltip,
            height,
            // Можно добавить логику отображения/скрытия на основе зума, если нужно
        });

        // 4. Кнопки управления (всегда)
        resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
        resetRegionButton(svg, onResetRegion);

      },
      [ref, filteredFlights, initializeZoom, resetZoom, onRegionSelect, onResetRegion, setTooltip]
    );

    useEffect(() => {
        if (!mapData) return;

        // Заменяем координаты местами
        const swappedMapData = swapMapDataCoordinates(mapData);

        let dataToRender;
        let isSingleRegion = false;

        if (selectedRegion && selectedRegion.id) {
            // Ищем выбранный регион по ID или имени (для совместимости)
            const foundFeature = swappedMapData.features.find(
                (feature) =>
                feature.properties?.['hc-key'] === selectedRegion.id ||
                feature.properties?.region === selectedRegion.id ||
                feature.properties?.region === selectedRegion.name // Проверяем также по имени
            );

            if (foundFeature) {
                // Даже если регион выбран, рендерим всю карту, но можем подсветить регион
                // dataToRender = {
                //     type: 'FeatureCollection',
                //     features: [foundFeature],
                // };
                // isSingleRegion = true;
                // console.log('MapVisualization: Would render single region, but rendering all with highlight:', selectedRegion.name || selectedRegion.id);
                
                // Для этого примера - рендерим всю карту всегда
                dataToRender = swappedMapData;
                isSingleRegion = false; // Всегда false теперь
                
                // Здесь можно вызвать callback для подсветки региона в createRegions
                // Например, передать selectedRegion.id как prop
                
            } else {
                // Если регион не найден, рендерим все регионы
                console.warn('MapVisualization: Selected region not found, rendering all regions:', selectedRegion);
                dataToRender = swappedMapData;
                isSingleRegion = false;
            }
        } else {
            // Если регион не выбран, рендерим все регионы
            dataToRender = swappedMapData;
            isSingleRegion = false; // Всегда false теперь
        }

        if (
            (dataToRender.type === 'FeatureCollection' && dataToRender.features.length > 0) ||
            dataToRender.type === 'Feature'
        ) {
            renderMap(dataToRender, isSingleRegion);
        } else {
            console.error('MapVisualization: Invalid data to render:', dataToRender);
        }
    }, [mapData, selectedRegion, renderMap, filteredFlights]); // Добавлен filteredFlights в зависимости

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
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default MapVisualization;


*/
