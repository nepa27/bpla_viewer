// components/MapVisualization/MapSingleRegion.jsx
import { geoIdentity, geoPath, select } from 'd3';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { createCities } from '../../d3/createCities';
import { createRegionsWithFlightData } from '../../d3/createRegionsWithFlightData';
import { resetZoomButton } from '../../d3/resetZoomButton';
import { useMapZoom } from '../../d3/useMapZoom';
import { swapMapDataCoordinates } from '../../utils/swapMapDataCoordinates';

const MapSingleRegion = forwardRef(
  ({ mapData, selectedRegion, flightsByRegion, maxFlightsInRegion, onResetRegion }, ref) => {
    const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
    const mapGroupRef = useRef(null);
    const svgRef = useRef(null);
    const { initializeZoom, resetZoom, currentScale } = useMapZoom();

    const renderMap = useCallback(
      (dataToRender) => {
        const svg = select(ref.current);
        svgRef.current = svg.node();

        svg.selectAll('*').remove();

        const width = 1200;
        const height = 600;

        svg
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('style', 'max-width: 100%; background-color: #2c3e50;');

        const projection = geoIdentity().reflectY(true).fitSize([width, height], dataToRender);

        console.log('currentScale > ', currentScale);

        const path = geoPath().projection(projection);
        const mapGroup = svg.append('g').attr('class', 'map-group');
        mapGroupRef.current = mapGroup.node();

        // Создаем регионы
        createRegionsWithFlightData({
          svg,
          mapGroup,
          dataToRender,
          path,
          setSelectedRegion: () => {}, // Не нужен выбор региона внутри одного региона
          isSingleRegion: true,
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
          isSingleRegion: true,
          height,
        });

        resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
      },
      [ref, setTooltip, flightsByRegion, maxFlightsInRegion],
    );

    useEffect(() => {
      const swappedMapData = swapMapDataCoordinates(mapData);

      const foundFeature = swappedMapData.features.find(
        (feature) =>
          feature.properties?.region_id === selectedRegion.id ||
          feature.properties?.region === selectedRegion.id,
      );

      if (foundFeature) {
        const dataToRender = {
          type: 'FeatureCollection',
          features: [foundFeature],
        };

        renderMap(dataToRender);
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

export default MapSingleRegion;
